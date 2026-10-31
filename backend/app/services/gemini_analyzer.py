"""
Gemini AI Analysis Service.
Uses the official Google Gen AI SDK (google-genai) to perform comprehensive,
role-specific resume analysis and job matching.
"""

import json
import os
import re
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.schemas.analysis import (
    JobMatchScore,
    ScoreBreakdown,
    SkillCategoryScore,
    SkillsAnalysis,
    KeywordAnalysis,
    ResumeStrengths,
    ImprovementAreas,
    BulletImprovement,
    SkillRoadmapItem,
    WeeklyRoadmap,
    SkillGapRoadmap,
    ResumeAnalysisResponse,
    ATSCompatibilityScore,
)
from app.utils.role_definitions import get_role_prompt_guidance


class GeminiKeyMissingError(Exception):
    """Raised when GEMINI_API_KEY is not set."""
    pass


class GeminiAnalysisError(Exception):
    """Raised when Gemini API fails or returns invalid structure."""
    pass


from pathlib import Path
from dotenv import load_dotenv

class GeminiAnalyzer:
    def __init__(self, api_key: Optional[str] = None):
        if api_key is not None:
            self.api_key = api_key.strip()
        else:
            if "GEMINI_API_KEY" not in os.environ:
                env_file = Path(__file__).resolve().parent.parent.parent / ".env"
                if env_file.exists():
                    load_dotenv(dotenv_path=env_file)
            self.api_key = os.getenv("GEMINI_API_KEY", "").strip()


    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    def _get_client(self) -> genai.Client:
        if not self.is_configured():
            raise GeminiKeyMissingError(
                "Gemini API key is not configured. Please set GEMINI_API_KEY in backend/.env "
                "or provide it in request settings to enable real AI analysis."
            )
        return genai.Client(api_key=self.api_key)

    def _call_gemini_with_fallback(
        self,
        client: genai.Client,
        prompt: str,
        system_instruction: Optional[str] = None,
    ) -> str:
        """
        Executes Gemini content generation with multi-model fallback and transient error retries.
        """
        import time

        models_to_try = [
            os.getenv("GEMINI_MODEL", "gemini-3.5-flash"),
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.8-flash",
            "gemini-3-flash-preview",
            "gemini-flash-latest",
        ]

        unique_models: List[str] = []
        for m in models_to_try:
            if m and m not in unique_models:
                unique_models.append(m)

        last_error = None
        for model_name in unique_models:
            for attempt in range(2):
                try:
                    config_kwargs: Dict[str, Any] = {
                        "response_mime_type": "application/json",
                        "temperature": 0.2,
                    }
                    if system_instruction:
                        config_kwargs["system_instruction"] = system_instruction

                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=types.GenerateContentConfig(**config_kwargs),
                    )
                    if response and response.text:
                        return response.text.strip()
                except APIError as e:
                    last_error = e
                    err_lower = str(e).lower()
                    is_transient = (
                        e.code in [404, 429, 500, 502, 503, 504]
                        or "not available" in err_lower
                        or "not found" in err_lower
                        or "demand" in err_lower
                        or "unavailable" in err_lower
                        or "quota" in err_lower
                        or "rate" in err_lower
                        or "exhausted" in err_lower
                    )
                    if is_transient:
                        time.sleep(0.6 * (attempt + 1))
                        continue
                    raise GeminiAnalysisError(f"Gemini API error ({e.code}): {e.message}")
                except Exception as e:
                    last_error = e
                    continue

        if last_error:
            if isinstance(last_error, APIError):
                raise GeminiAnalysisError(f"Gemini API error ({last_error.code}): {last_error.message}")
            raise GeminiAnalysisError(f"Failed to communicate with Gemini API: {str(last_error)}")
        raise GeminiAnalysisError("Gemini returned an empty response.")

    def analyze_resume(
        self,
        resume_text: str,
        role: str,
        job_description: str,
        filename: str = "Uploaded_Resume.pdf",
        ats_score: Optional[ATSCompatibilityScore] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> ResumeAnalysisResponse:
        """
        Executes complete multi-dimensional resume analysis against role and job description.
        """
        if ats_score is None:
            from app.services.ats_scanner import evaluate_ats_compatibility
            ats_score = evaluate_ats_compatibility(
                resume_text=resume_text,
                role=role,
                job_description=job_description,
                filename=filename,
                metadata=metadata,
            )

        client = self._get_client()
        role_guidance = get_role_prompt_guidance(role)

        system_instruction = f"""You are ResumeAI, a world-class senior technical recruiter, career architect, and hiring bar raiser.
Your task is to perform an honest, in-depth, rigorous, and constructive evaluation of a candidate's resume against a specific target job role and job description.

{role_guidance}

CRITICAL RULES & INTEGRITY DIRECTIVES:
1. FACTUAL ACCURACY: NEVER invent, hallucinate, or assume candidate qualifications, skills, work history, degrees, or achievements. Evaluate only what is legitimately evidenced in the resume text.
2. JOB MATCH SCORE ESTIMATE: Compute an estimated match score between 0 and 100 based strictly on:
   - Relevant Technical Skills (40% weight)
   - Keyword & Terminology Alignment (25% weight)
   - Practical Projects & Experience Fit (25% weight)
   - Educational & Domain Relevance (10% weight)
   Score categories:
   - 85-100: Exceptional Match
   - 70-84: Strong Match
   - 50-69: Moderate Match
   - 0-49: Low Match
3. STRICT INTEGRITY IN BULLET POINT REWRITING: Identify 3 to 6 actual bullet points from the resume that could be stronger.
   - Strictly preserve the candidate's actual experience.
   - NEVER invent achievements, performance metrics, technologies, responsibilities, project details, or business impact!
   - When quantitative results or metrics are unavailable in the original text, insert clear placeholders like '[insert actual metric]' (or '[X%]', '[Y requests/sec]').
   - Rewrite each bullet using active power verbs and the XYZ impact formula ('Accomplished [X] measured by [Y] by doing [Z]').
4. SKILL-GAP ROADMAP: Divide missing skills into High (mandatory for this role), Medium (valuable additions), and Low (optional bonuses). For each, give what to learn, why it matters, recommended order, and a concrete mini-project.
   Provide a 4-week, 30-day structured roadmap with tangible weekly milestones.
5. JSON OUTPUT: Return ONLY valid JSON adhering strictly to the required schema."""

        prompt = f"""Target Role: {role}

Candidate Resume Text:
```
{resume_text}
```

Target Job Description:
```
{job_description}
```

Analyze the resume and produce a structured JSON object matching this exact structure:
{{
  "candidate_name": "Candidate Name extracted from resume, or 'Candidate'",
  "job_title": "Extracted Job Title from Job Description, or the Target Role",
  "match_score": {{
    "overall_score": 78,
    "match_category": "Strong Match",
    "explanation": "Detailed 2-3 sentence explanation of the score drivers and alignment.",
    "score_breakdown": {{
      "skills_score": 80,
      "keywords_score": 75,
      "experience_score": 78,
      "education_score": 85
    }}
  }},
  "skills_analysis": {{
    "matching_skills": ["List of verified matching skills"],
    "missing_skills": ["List of critical skills in JD missing from resume"],
    "additional_skills": ["List of candidate's skills that add value but were not in JD"],
    "skill_category_scores": [
      {{"category": "Core Languages", "candidate_score": 85, "required_score": 90}},
      {{"category": "Frameworks & Libraries", "candidate_score": 70, "required_score": 85}},
      {{"category": "Databases & Storage", "candidate_score": 75, "required_score": 80}},
      {{"category": "DevOps & Tools", "candidate_score": 60, "required_score": 75}},
      {{"category": "Domain Concepts", "candidate_score": 80, "required_score": 80}}
    ]
  }},
  "keyword_analysis": {{
    "found_keywords": ["Important terms found in resume"],
    "missing_keywords": ["Crucial terms from JD missing from resume"],
    "important_job_keywords": ["Top 10 most critical terms from the JD"]
  }},
  "strengths": {{
    "strong_sections": ["Bullet points of strong areas"],
    "relevant_projects": ["Bullet points highlighting relevant projects"],
    "relevant_experience": ["Bullet points of relevant experience"]
  }},
  "improvement_areas": {{
    "weak_bullet_points": ["Specific lines or sections needing enhancement"],
    "missing_information": ["Gaps in documentation like missing links, dates, or scopes"],
    "formatting_and_clarity": ["Clarity and readability recommendations"]
  }},
  "bullet_improvements": [
    {{
      "original": "Original line from candidate's resume",
      "improved": "Rewritten professional version with action verbs and [insert actual metric] placeholder",
      "explanation": "Why this version conveys greater business impact without inventing facts",
      "action_verbs_used": ["Spearheaded", "Engineered", "Optimized"],
      "metrics_note": "Candidate Tip: Replace [insert actual metric] with your verified reduction in latency, volume, or cost."
    }}
  ],
  "skill_gap_roadmap": {{
    "high_priority": [
      {{
        "skill_name": "Name of Skill",
        "priority": "High",
        "what_to_learn": "Core concepts to master",
        "why_it_matters": "Why this is critical for the target role",
        "recommended_order": 1,
        "mini_project": "A practical 2-day project to prove proficiency"
      }}
    ],
    "medium_priority": [
      {{
        "skill_name": "Name of Skill",
        "priority": "Medium",
        "what_to_learn": "Concepts",
        "why_it_matters": "Relevance",
        "recommended_order": 2,
        "mini_project": "Mini project"
      }}
    ],
    "low_priority": [
      {{
        "skill_name": "Name of Skill",
        "priority": "Low",
        "what_to_learn": "Concepts",
        "why_it_matters": "Relevance",
        "recommended_order": 3,
        "mini_project": "Mini project"
      }}
    ],
    "thirty_day_plan": [
      {{
        "week_number": 1,
        "focus_theme": "Foundation & Core Missing Prerequisite",
        "tasks": ["Task 1", "Task 2", "Task 3"],
        "milestone_deliverable": "Tangible deliverable for Week 1"
      }},
      {{
        "week_number": 2,
        "focus_theme": "Hands-on Framework Application",
        "tasks": ["Task 1", "Task 2", "Task 3"],
        "milestone_deliverable": "Tangible deliverable for Week 2"
      }},
      {{
        "week_number": 3,
        "focus_theme": "Integration & Project Portfolio Build",
        "tasks": ["Task 1", "Task 2", "Task 3"],
        "milestone_deliverable": "Tangible deliverable for Week 3"
      }},
      {{
        "week_number": 4,
        "focus_theme": "Testing, Deployment & Interview Readiness",
        "tasks": ["Task 1", "Task 2", "Task 3"],
        "milestone_deliverable": "Tangible deliverable for Week 4"
      }}
    ]
  }},
  "personalized_recommendations": [
    "Personalized, actionable advice item 1",
    "Personalized, actionable advice item 2",
    "Personalized, actionable advice item 3",
    "Personalized, actionable advice item 4"
  ]
}}"""

        raw_text = self._call_gemini_with_fallback(
            client=client,
            prompt=prompt,
            system_instruction=system_instruction,
        )

        clean_json = raw_text.strip()
        if clean_json.startswith("```"):
            clean_json = re.sub(r"^```(?:json)?\s*", "", clean_json)
            clean_json = re.sub(r"\s*```$", "", clean_json)

        # Regex search for outer JSON object if extra text surrounds it
        match = re.search(r"(\{.*\})", clean_json, re.DOTALL)
        if match:
            clean_json = match.group(1)

        try:
            data = json.loads(clean_json)
        except json.JSONDecodeError as e:
            raise GeminiAnalysisError(f"Failed to parse Gemini response as JSON: {str(e)}")

        return self._format_and_validate(data, filename, role, ats_score=ats_score)

    def improve_bullets(
        self,
        bullets: List[str],
        role: str,
        job_description: str = "",
    ) -> List[BulletImprovement]:
        """
        Enhances specific resume bullet points with high-impact power verbs and metric placeholders.
        """
        if not bullets:
            return []

        client = self._get_client()
        bullets_text = "\n".join([f"- {b}" for b in bullets])
        prompt = f"""Role: {role}
Job Context: {job_description or 'Standard industry benchmark'}
Bullets to improve:
{bullets_text}

Transform each bullet into a high-impact, professional bullet.
RULES:
1. STRICT INTEGRITY: Strictly preserve the candidate's actual experience.
2. Under NO circumstances invent achievements, performance metrics, technologies, responsibilities, project details, or business impact.
3. Insert clear placeholders like '[insert actual metric]' or '[X%]' when quantitative results are unavailable in the original bullet.
4. Use powerful active verbs and professional phrasing.
Return JSON array of objects with keys: original, improved, explanation, action_verbs_used (array of strings), metrics_note."""

        raw_text = self._call_gemini_with_fallback(client=client, prompt=prompt, system_instruction=None)

        clean_json = raw_text.strip()
        if clean_json.startswith("```"):
            clean_json = re.sub(r"^```(?:json)?\s*", "", clean_json)
            clean_json = re.sub(r"\s*```$", "", clean_json)

        match_arr = re.search(r"(\[.*\])", clean_json, re.DOTALL)
        if match_arr:
            clean_json = match_arr.group(1)

        try:
            data = json.loads(clean_json)
        except json.JSONDecodeError:
            match_obj = re.search(r"(\{.*\})", clean_json, re.DOTALL)
            if match_obj:
                try:
                    obj = json.loads(match_obj.group(1))
                    data = obj.get("bullets", []) if isinstance(obj, dict) else []
                except Exception:
                    data = []
            else:
                data = []

        if isinstance(data, dict) and "bullets" in data:
            data = data["bullets"]

        results: List[BulletImprovement] = []
        if isinstance(data, list):
            for i, b in enumerate(data):
                if isinstance(b, dict):
                    results.append(
                        BulletImprovement(
                            original=str(b.get("original") or (bullets[i] if i < len(bullets) else "")),
                            improved=str(b.get("improved") or ""),
                            explanation=str(b.get("explanation") or "Enhanced with active verbs and quantifiable framing."),
                            action_verbs_used=[str(v) for v in b.get("action_verbs_used", []) if v],
                            metrics_note=str(b.get("metrics_note") or "Candidate Tip: Add your true metrics where indicated."),
                        )
                    )
        return results

    def _format_and_validate(
        self,
        data: Dict[str, Any],
        filename: str,
        role: str,
        ats_score: ATSCompatibilityScore,
    ) -> ResumeAnalysisResponse:
        """Validates and populates defaults for the Pydantic response."""
        now_str = datetime.now(timezone.utc).strftime("%B %d, %Y - %H:%M UTC")

        # Parse match score
        raw_score = data.get("match_score", {}) if isinstance(data.get("match_score"), dict) else {}
        try:
            overall = min(max(int(raw_score.get("overall_score", 65)), 0), 100)
        except (ValueError, TypeError):
            overall = 65

        category = raw_score.get("match_category")
        if not category:
            if overall >= 85:
                category = "Exceptional Match"
            elif overall >= 70:
                category = "Strong Match"
            elif overall >= 50:
                category = "Moderate Match"
            else:
                category = "Low Match"

        raw_breakdown = raw_score.get("score_breakdown", {}) if isinstance(raw_score.get("score_breakdown"), dict) else {}
        def _safe_int(val, default):
            try:
                return min(max(int(val), 0), 100)
            except (ValueError, TypeError):
                return default

        score_breakdown = ScoreBreakdown(
            skills_score=_safe_int(raw_breakdown.get("skills_score"), overall),
            keywords_score=_safe_int(raw_breakdown.get("keywords_score"), overall),
            experience_score=_safe_int(raw_breakdown.get("experience_score"), overall),
            education_score=_safe_int(raw_breakdown.get("education_score"), overall),
        )

        match_score = JobMatchScore(
            overall_score=overall,
            match_category=str(category),
            explanation=str(raw_score.get("explanation") or f"Estimated alignment for {role} based on identified skills and experience."),
            score_breakdown=score_breakdown,
        )

        # Parse skills analysis
        raw_skills = data.get("skills_analysis", {}) if isinstance(data.get("skills_analysis"), dict) else {}
        cat_scores: List[SkillCategoryScore] = []
        for cs in raw_skills.get("skill_category_scores", []):
            if isinstance(cs, dict):
                cat_scores.append(
                    SkillCategoryScore(
                        category=str(cs.get("category", "General")),
                        candidate_score=_safe_int(cs.get("candidate_score"), 70),
                        required_score=_safe_int(cs.get("required_score"), 80),
                    )
                )
        if not cat_scores:
            cat_scores = [
                SkillCategoryScore(category="Core Languages", candidate_score=75, required_score=85),
                SkillCategoryScore(category="Frameworks & Tools", candidate_score=70, required_score=80),
                SkillCategoryScore(category="Databases & Data", candidate_score=65, required_score=75),
                SkillCategoryScore(category="Architecture & Practices", candidate_score=70, required_score=80),
            ]

        skills_analysis = SkillsAnalysis(
            matching_skills=[str(s) for s in raw_skills.get("matching_skills", []) if s],
            missing_skills=[str(s) for s in raw_skills.get("missing_skills", []) if s],
            additional_skills=[str(s) for s in raw_skills.get("additional_skills", []) if s],
            skill_category_scores=cat_scores,
        )

        # Keywords
        raw_kw = data.get("keyword_analysis", {}) if isinstance(data.get("keyword_analysis"), dict) else {}
        keyword_analysis = KeywordAnalysis(
            found_keywords=[str(k) for k in raw_kw.get("found_keywords", []) if k],
            missing_keywords=[str(k) for k in raw_kw.get("missing_keywords", []) if k],
            important_job_keywords=[str(k) for k in raw_kw.get("important_job_keywords", []) if k],
        )

        # Strengths
        raw_str = data.get("strengths", {}) if isinstance(data.get("strengths"), dict) else {}
        strengths = ResumeStrengths(
            strong_sections=[str(s) for s in raw_str.get("strong_sections", ["Well-articulated project summaries."]) if s],
            relevant_projects=[str(p) for p in raw_str.get("relevant_projects", []) if p],
            relevant_experience=[str(e) for e in raw_str.get("relevant_experience", []) if e],
        )

        # Improvement areas
        raw_imp = data.get("improvement_areas", {}) if isinstance(data.get("improvement_areas"), dict) else {}
        improvement_areas = ImprovementAreas(
            weak_bullet_points=[str(w) for w in raw_imp.get("weak_bullet_points", []) if w],
            missing_information=[str(m) for m in raw_imp.get("missing_information", []) if m],
            formatting_and_clarity=[str(f) for f in raw_imp.get("formatting_and_clarity", []) if f],
        )

        # Bullet improvements
        bullet_improvements: List[BulletImprovement] = []
        for i, bi in enumerate(data.get("bullet_improvements", []), 1):
            if isinstance(bi, dict):
                bullet_improvements.append(
                    BulletImprovement(
                        original=str(bi.get("original") or f"Resume bullet point {i}"),
                        improved=str(bi.get("improved") or str(bi.get("original") or "")),
                        explanation=str(bi.get("explanation") or "Structured with power action verbs and metric placeholders."),
                        action_verbs_used=[str(v) for v in bi.get("action_verbs_used", []) if v],
                        metrics_note=str(bi.get("metrics_note") or "Candidate Tip: Add your true metrics where indicated.")
                    )
                )

        # Roadmap
        raw_road = data.get("skill_gap_roadmap", {}) if isinstance(data.get("skill_gap_roadmap"), dict) else {}

        def _parse_item(item: Any, default_priority: str, order: int) -> Optional[SkillRoadmapItem]:
            if not isinstance(item, dict):
                return None
            return SkillRoadmapItem(
                skill_name=str(item.get("skill_name") or f"Skill Competency {order}"),
                priority=str(item.get("priority") or default_priority).capitalize(),
                what_to_learn=str(item.get("what_to_learn") or "Core principles and industry patterns"),
                why_it_matters=str(item.get("why_it_matters") or "Essential for role competencies"),
                recommended_order=_safe_int(item.get("recommended_order"), order),
                mini_project=str(item.get("mini_project") or "Build a practical prototype application"),
            )

        high_p = [item for i, r_item in enumerate(raw_road.get("high_priority", []), 1) if (item := _parse_item(r_item, "High", i))]
        med_p = [item for i, r_item in enumerate(raw_road.get("medium_priority", []), 1) if (item := _parse_item(r_item, "Medium", i))]
        low_p = [item for i, r_item in enumerate(raw_road.get("low_priority", []), 1) if (item := _parse_item(r_item, "Low", i))]

        thirty_day: List[WeeklyRoadmap] = []
        for i, w in enumerate(raw_road.get("thirty_day_plan", []), 1):
            if isinstance(w, dict):
                tasks = w.get("tasks", [])
                if isinstance(tasks, str):
                    tasks = [tasks]
                thirty_day.append(
                    WeeklyRoadmap(
                        week_number=_safe_int(w.get("week_number"), i),
                        focus_theme=str(w.get("focus_theme") or f"Week {i} Mastery"),
                        tasks=[str(t) for t in tasks] if tasks else ["Study key documentation", "Implement practice exercises"],
                        milestone_deliverable=str(w.get("milestone_deliverable") or "Complete practice deliverable"),
                    )
                )

        if not thirty_day:
            thirty_day = [
                WeeklyRoadmap(week_number=1, focus_theme="Core Missing Prerequisites", tasks=["Review missing domain libraries", "Setup local sandbox"], milestone_deliverable="Complete baseline configuration"),
                WeeklyRoadmap(week_number=2, focus_theme="Hands-on Project Application", tasks=["Implement core algorithms/services", "Integrate databases"], milestone_deliverable="Working service module"),
                WeeklyRoadmap(week_number=3, focus_theme="Optimization & Architecture", tasks=["Add unit tests & CI/CD", "Optimize performance"], milestone_deliverable="Production-ready repository"),
                WeeklyRoadmap(week_number=4, focus_theme="Portfolio & Interview Review", tasks=["Document architecture", "Rehearse role-specific scenarios"], milestone_deliverable="Portfolio project submission"),
            ]

        skill_gap_roadmap = SkillGapRoadmap(
            high_priority=high_p,
            medium_priority=med_p,
            low_priority=low_p,
            thirty_day_plan=thirty_day,
        )

        cand_name = data.get("candidate_name") or "Candidate"
        if not isinstance(cand_name, str) or not cand_name.strip():
            cand_name = "Candidate"

        recs = [str(r) for r in data.get("personalized_recommendations", []) if r]

        return ResumeAnalysisResponse(
            candidate_name=cand_name,
            filename=filename,
            selected_role=role,
            job_title=str(data.get("job_title") or role),
            match_score=match_score,
            ats_score=ats_score,
            skills_analysis=skills_analysis,
            keyword_analysis=keyword_analysis,
            strengths=strengths,
            improvement_areas=improvement_areas,
            bullet_improvements=bullet_improvements,
            skill_gap_roadmap=skill_gap_roadmap,
            personalized_recommendations=recs,
            created_at=now_str,
        )
