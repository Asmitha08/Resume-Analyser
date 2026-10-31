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
)
from app.utils.role_definitions import get_role_prompt_guidance


class GeminiKeyMissingError(Exception):
    """Raised when GEMINI_API_KEY is not set."""
    pass


class GeminiAnalysisError(Exception):
    """Raised when Gemini API fails or returns invalid structure."""
    pass


class GeminiAnalyzer:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "").strip()

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    def _get_client(self) -> genai.Client:
        if not self.is_configured():
            raise GeminiKeyMissingError(
                "Gemini API key is not configured. Please set GEMINI_API_KEY in backend/.env "
                "or provide it in request settings to enable real AI analysis."
            )
        return genai.Client(api_key=self.api_key)

    def analyze_resume(
        self,
        resume_text: str,
        role: str,
        job_description: str,
        filename: str = "Uploaded_Resume.pdf"
    ) -> ResumeAnalysisResponse:
        """
        Executes complete multi-dimensional resume analysis against role and job description.
        """
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
3. BULLET POINT ENHANCEMENT: Identify 3 to 6 actual bullet points from the resume that could be stronger. Rewrite each using active power verbs and the XYZ impact formula ('Accomplished [X] measured by [Y] by doing [Z]').
   NEVER invent numbers or percentages! Instead, insert clear placeholders like '[X%]' or '[Y requests/sec]' and explicitly instruct the candidate to insert their true numbers.
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
      "improved": "Rewritten professional version with action verbs and [X%] placeholder",
      "explanation": "Why this version conveys greater business impact",
      "action_verbs_used": ["Spearheaded", "Engineered", "Optimized"],
      "metrics_note": "Candidate Tip: Replace [X%] with your verified reduction in latency or cost."
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

        try:
            # We use gemini-2.5-flash with JSON mode
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    temperature=0.2,
                ),
            )
        except APIError as e:
            raise GeminiAnalysisError(f"Gemini API error ({e.code}): {e.message}")
        except Exception as e:
            raise GeminiAnalysisError(f"Failed to communicate with Gemini API: {str(e)}")

        if not response.text:
            raise GeminiAnalysisError("Gemini returned an empty response.")

        raw_json = response.text.strip()
        # Clean any markdown codefence if present
        if raw_json.startswith("```"):
            raw_json = re.sub(r"^```(?:json)?\s*", "", raw_json)
            raw_json = re.sub(r"\s*```$", "", raw_json)

        try:
            data = json.loads(raw_json)
        except json.JSONDecodeError as e:
            raise GeminiAnalysisError(f"Failed to parse Gemini response as JSON: {str(e)}")

        return self._format_and_validate(data, filename, role)

    def _format_and_validate(self, data: Dict[str, Any], filename: str, role: str) -> ResumeAnalysisResponse:
        """Validates and populates defaults for the Pydantic response."""
        now_str = datetime.now(timezone.utc).strftime("%B %d, %Y - %H:%M UTC")

        # Parse match score
        raw_score = data.get("match_score", {})
        overall = min(max(int(raw_score.get("overall_score", 65)), 0), 100)
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

        raw_breakdown = raw_score.get("score_breakdown", {})
        score_breakdown = ScoreBreakdown(
            skills_score=min(max(int(raw_breakdown.get("skills_score", overall)), 0), 100),
            keywords_score=min(max(int(raw_breakdown.get("keywords_score", overall)), 0), 100),
            experience_score=min(max(int(raw_breakdown.get("experience_score", overall)), 0), 100),
            education_score=min(max(int(raw_breakdown.get("education_score", overall)), 0), 100),
        )

        match_score = JobMatchScore(
            overall_score=overall,
            match_category=category,
            explanation=raw_score.get("explanation", f"Estimated alignment for {role} based on identified skills and experience."),
            score_breakdown=score_breakdown,
        )

        # Parse skills analysis
        raw_skills = data.get("skills_analysis", {})
        cat_scores = []
        for cs in raw_skills.get("skill_category_scores", []):
            cat_scores.append(
                SkillCategoryScore(
                    category=cs.get("category", "General"),
                    candidate_score=min(max(int(cs.get("candidate_score", 70)), 0), 100),
                    required_score=min(max(int(cs.get("required_score", 80)), 0), 100),
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
            matching_skills=raw_skills.get("matching_skills", []),
            missing_skills=raw_skills.get("missing_skills", []),
            additional_skills=raw_skills.get("additional_skills", []),
            skill_category_scores=cat_scores,
        )

        # Keywords
        raw_kw = data.get("keyword_analysis", {})
        keyword_analysis = KeywordAnalysis(
            found_keywords=raw_kw.get("found_keywords", []),
            missing_keywords=raw_kw.get("missing_keywords", []),
            important_job_keywords=raw_kw.get("important_job_keywords", []),
        )

        # Strengths
        raw_str = data.get("strengths", {})
        strengths = ResumeStrengths(
            strong_sections=raw_str.get("strong_sections", ["Well-articulated project summaries."]),
            relevant_projects=raw_str.get("relevant_projects", []),
            relevant_experience=raw_str.get("relevant_experience", []),
        )

        # Improvement areas
        raw_imp = data.get("improvement_areas", {})
        improvement_areas = ImprovementAreas(
            weak_bullet_points=raw_imp.get("weak_bullet_points", []),
            missing_information=raw_imp.get("missing_information", []),
            formatting_and_clarity=raw_imp.get("formatting_and_clarity", []),
        )

        # Bullet improvements
        bullet_improvements = []
        for bi in data.get("bullet_improvements", []):
            bullet_improvements.append(
                BulletImprovement(
                    original=bi.get("original", ""),
                    improved=bi.get("improved", ""),
                    explanation=bi.get("explanation", ""),
                    action_verbs_used=bi.get("action_verbs_used", []),
                    metrics_note=bi.get("metrics_note", "Candidate Tip: Add your true metrics where indicated.")
                )
            )

        # Roadmap
        raw_road = data.get("skill_gap_roadmap", {})
        high_p = [SkillRoadmapItem(**item) for item in raw_road.get("high_priority", []) if isinstance(item, dict)]
        med_p = [SkillRoadmapItem(**item) for item in raw_road.get("medium_priority", []) if isinstance(item, dict)]
        low_p = [SkillRoadmapItem(**item) for item in raw_road.get("low_priority", []) if isinstance(item, dict)]

        thirty_day = []
        for w in raw_road.get("thirty_day_plan", []):
            thirty_day.append(
                WeeklyRoadmap(
                    week_number=int(w.get("week_number", 1)),
                    focus_theme=w.get("focus_theme", "Skill Building"),
                    tasks=w.get("tasks", []),
                    milestone_deliverable=w.get("milestone_deliverable", "Complete practice module"),
                )
            )

        skill_gap_roadmap = SkillGapRoadmap(
            high_priority=high_p,
            medium_priority=med_p,
            low_priority=low_p,
            thirty_day_plan=thirty_day,
        )

        return ResumeAnalysisResponse(
            candidate_name=data.get("candidate_name", "Candidate"),
            filename=filename,
            selected_role=role,
            job_title=data.get("job_title", role),
            match_score=match_score,
            skills_analysis=skills_analysis,
            keyword_analysis=keyword_analysis,
            strengths=strengths,
            improvement_areas=improvement_areas,
            bullet_improvements=bullet_improvements,
            skill_gap_roadmap=skill_gap_roadmap,
            personalized_recommendations=data.get("personalized_recommendations", []),
            created_at=now_str,
        )
