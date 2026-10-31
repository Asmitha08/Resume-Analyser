from typing import List, Optional
from pydantic import BaseModel, Field


class ScoreBreakdown(BaseModel):
    skills_score: int = Field(..., ge=0, le=100, description="Skill alignment score")
    keywords_score: int = Field(..., ge=0, le=100, description="Keyword coverage score")
    experience_score: int = Field(..., ge=0, le=100, description="Project and experience relevance score")
    education_score: int = Field(..., ge=0, le=100, description="Education and fundamentals score")


class JobMatchScore(BaseModel):
    overall_score: int = Field(..., ge=0, le=100, description="Overall match score (0-100)")
    match_category: str = Field(..., description="Match category e.g. Strong Match, Moderate Match")
    explanation: str = Field(..., description="Clear explanation of the score and contributing factors")
    score_breakdown: ScoreBreakdown
    disclaimer: str = Field(
        default="AI Job Match Estimate: This score is an estimated generative alignment metric based on semantic resume and job description analysis. It is not an actual or guaranteed proprietary Applicant Tracking System (ATS) calculation.",
        description="Mandatory disclaimer distinguishing AI estimate from ATS guarantees"
    )


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


class ResumeAnalysisResponse(BaseModel):
    candidate_name: Optional[str] = "Candidate"
    filename: str
    selected_role: str
    job_title: str
    match_score: JobMatchScore
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
    job_description: str = Field(..., min_length=20)
    filename: Optional[str] = "Pasted_Resume.txt"


class ImproveBulletsRequest(BaseModel):
    bullets: List[str]
    role: str
    job_description: Optional[str] = ""


class GenerateRoadmapRequest(BaseModel):
    missing_skills: List[str]
    role: str
    target_timeline_days: Optional[int] = 30
