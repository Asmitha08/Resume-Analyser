from typing import List, Optional
from pydantic import BaseModel, Field


class ScoreBreakdown(BaseModel):
    skills_score: int = Field(..., ge=0, le=100, description="Skill alignment score")
    keywords_score: int = Field(..., ge=0, le=100, description="Keyword coverage score")
    experience_score: int = Field(..., ge=0, le=100, description="Project and experience relevance score")
    education_score: int = Field(..., ge=0, le=100, description="Education and fundamentals score")

    def __getitem__(self, item):
        return getattr(self, item)

    def __contains__(self, item):
        return hasattr(self, item)

    def get(self, item, default=None):
        return getattr(self, item, default)


class JobMatchScore(BaseModel):
    overall_score: int = Field(..., ge=0, le=100, description="Overall match score (0-100)")
    match_category: str = Field(..., description="Match category e.g. Strong Match, Moderate Match")
    explanation: str = Field(..., description="Clear explanation of the score and contributing factors")
    score_breakdown: ScoreBreakdown
    disclaimer: str = Field(
        default="AI Job Match Estimate: This score is an estimated generative alignment metric based on semantic resume and job description analysis. It is not an actual or guaranteed proprietary Applicant Tracking System (ATS) calculation.",
        description="Mandatory disclaimer distinguishing AI estimate from ATS guarantees"
    )

    def __getitem__(self, item):
        return getattr(self, item)

    def __contains__(self, item):
        return hasattr(self, item)

    def get(self, item, default=None):
        return getattr(self, item, default)


class SkillCategoryScore(BaseModel):
    category: str = Field(..., description="e.g., Core Languages, Frameworks, Tools, Databases")
    candidate_score: int = Field(..., ge=0, le=100)
    required_score: int = Field(..., ge=0, le=100)


class SkillsAnalysis(BaseModel):
    matching_skills: List[str] = Field(default_factory=list, description="Skills present in both resume and JD")
    missing_skills: List[str] = Field(default_factory=list, description="Critical skills in JD missing from resume")
    additional_skills: List[str] = Field(default_factory=list, description="Valuable candidate skills not explicitly asked in JD")
    skill_category_scores: List[SkillCategoryScore] = Field(default_factory=list)


class KeywordAnalysis(BaseModel):
    found_keywords: List[str] = Field(default_factory=list, description="Key industry/job terms found in resume")
    missing_keywords: List[str] = Field(default_factory=list, description="Important terms from JD missing in resume")
    important_job_keywords: List[str] = Field(default_factory=list, description="Top terms extracted from job description")


class ResumeStrengths(BaseModel):
    strong_sections: List[str] = Field(default_factory=list)
    relevant_projects: List[str] = Field(default_factory=list)
    relevant_experience: List[str] = Field(default_factory=list)


class ImprovementAreas(BaseModel):
    weak_bullet_points: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)
    formatting_and_clarity: List[str] = Field(default_factory=list)


class BulletImprovement(BaseModel):
    original: str = Field(..., description="Original resume bullet point")
    improved: str = Field(..., description="Enhanced version with action verbs and quantifiable framing")
    explanation: str = Field(..., description="Why this version is more impactful")
    action_verbs_used: List[str] = Field(default_factory=list)
    metrics_note: str = Field(
        default="Candidate Tip: Add your true metrics (e.g., latency reduction %, active users, or throughput) where indicated.",
        description="Guidance reminder never to fabricate numbers"
    )


class SkillRoadmapItem(BaseModel):
    skill_name: str
    priority: str = Field(..., description="High, Medium, or Low")
    what_to_learn: str
    why_it_matters: str
    recommended_order: int
    mini_project: str


class WeeklyRoadmap(BaseModel):
    week_number: int
    focus_theme: str
    tasks: List[str]
    milestone_deliverable: str


class SkillGapRoadmap(BaseModel):
    high_priority: List[SkillRoadmapItem] = Field(default_factory=list)
    medium_priority: List[SkillRoadmapItem] = Field(default_factory=list)
    low_priority: List[SkillRoadmapItem] = Field(default_factory=list)
    thirty_day_plan: List[WeeklyRoadmap] = Field(default_factory=list)


class ATSScoreBreakdown(BaseModel):
    formatting_score: int = Field(..., ge=0, le=100, description="Formatting and layout readability (25% weight)")
    section_headings_score: int = Field(..., ge=0, le=100, description="Standard section headings (20% weight)")
    contact_info_score: int = Field(..., ge=0, le=100, description="Contact information and structure (15% weight)")
    parsing_quality_score: int = Field(..., ge=0, le=100, description="Text extraction and character quality (20% weight)")
    keyword_alignment_score: int = Field(..., ge=0, le=100, description="JD keyword alignment (20% weight)")

    def __getitem__(self, item):
        return getattr(self, item)

    def __contains__(self, item):
        return hasattr(self, item)

    def get(self, item, default=None):
        return getattr(self, item, default)


class ATSFormattingCheck(BaseModel):
    name: str = Field(..., description="Name of the check item")
    status: str = Field(..., description="pass, warning, or fail")
    detail: str = Field(..., description="Check findings and diagnostics")

    def __getitem__(self, item):
        return getattr(self, item)

    def __contains__(self, item):
        return hasattr(self, item)

    def get(self, item, default=None):
        return getattr(self, item, default)


class ATSCompatibilityScore(BaseModel):
    overall_score: int = Field(..., ge=0, le=100, description="Overall ATS Compatibility Score (0-100)")
    category: str = Field(..., description="e.g., High ATS Compatibility, Good ATS Compatibility")
    explanation: str = Field(..., description="Clear explanation of the ATS assessment")
    breakdown: ATSScoreBreakdown
    formatting_warnings: List[str] = Field(default_factory=list, description="Formatting risks or layout warnings")
    missing_sections: List[str] = Field(default_factory=list, description="Missing standard sections")
    detected_sections: List[str] = Field(default_factory=list, description="Detected standard sections")
    checks: List[ATSFormattingCheck] = Field(default_factory=list, description="Granular check diagnostics")
    keyword_coverage_percent: int = Field(default=0, ge=0, le=100)
    found_keywords_count: int = Field(default=0)
    total_keywords_count: int = Field(default=0)
    recommendations: List[str] = Field(default_factory=list, description="Specific recommendations to improve ATS compatibility")
    disclaimer: str = Field(
        default="ATS Compatibility Score: An application-defined heuristic estimate evaluating document formatting, layout, section parsing, and contact structure. It is not an official vendor-specific ATS score.",
        description="Mandatory ATS disclaimer"
    )

    def __getitem__(self, item):
        return getattr(self, item)

    def __contains__(self, item):
        return hasattr(self, item)

    def get(self, item, default=None):
        return getattr(self, item, default)


class ResumeAnalysisResponse(BaseModel):
    candidate_name: Optional[str] = "Candidate"
    filename: str
    selected_role: str
    job_title: str
    match_score: JobMatchScore
    ats_score: ATSCompatibilityScore
    skills_analysis: SkillsAnalysis
    keyword_analysis: KeywordAnalysis
    strengths: ResumeStrengths
    improvement_areas: ImprovementAreas
    bullet_improvements: List[BulletImprovement] = Field(default_factory=list)
    skill_gap_roadmap: SkillGapRoadmap
    personalized_recommendations: List[str] = Field(default_factory=list)
    created_at: str


class AnalyzeTextRequest(BaseModel):
    resume_text: str = Field(..., min_length=50)
    role: str
    job_description: Optional[str] = Field(default="", description="Target job description (uses industry role benchmark if omitted)")
    filename: Optional[str] = "Pasted_Resume.txt"


class ImproveBulletsRequest(BaseModel):
    bullets: List[str]
    role: str
    job_description: Optional[str] = ""


class GenerateRoadmapRequest(BaseModel):
    missing_skills: List[str]
    role: str
    target_timeline_days: Optional[int] = 30
