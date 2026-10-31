export interface ScoreBreakdown {
  skills_score: number;
  keywords_score: number;
  experience_score: number;
  education_score: number;
}

export interface JobMatchScore {
  overall_score: number;
  match_category: 'Exceptional Match' | 'Strong Match' | 'Moderate Match' | 'Low Match' | string;
  explanation: string;
  score_breakdown: ScoreBreakdown;
  disclaimer: string;
}

export interface SkillCategoryScore {
  category: string;
  candidate_score: number;
  required_score: number;
}

export interface SkillsAnalysis {
  matching_skills: string[];
  missing_skills: string[];
  additional_skills: string[];
  skill_category_scores: SkillCategoryScore[];
}

export interface KeywordAnalysis {
  found_keywords: string[];
  missing_keywords: string[];
  important_job_keywords: string[];
}

export interface ResumeStrengths {
  strong_sections: string[];
  relevant_projects: string[];
  relevant_experience: string[];
}

export interface ImprovementAreas {
  weak_bullet_points: string[];
  missing_information: string[];
  formatting_and_clarity: string[];
}

export interface BulletImprovement {
  original: string;
  improved: string;
  explanation: string;
  action_verbs_used: string[];
  metrics_note: string;
}

export interface SkillRoadmapItem {
  skill_name: string;
  priority: 'High' | 'Medium' | 'Low';
  what_to_learn: string;
  why_it_matters: string;
  recommended_order: number;
  mini_project: string;
}

export interface WeeklyRoadmap {
  week_number: number;
  focus_theme: string;
  tasks: string[];
  milestone_deliverable: string;
}

export interface SkillGapRoadmap {
  high_priority: SkillRoadmapItem[];
  medium_priority: SkillRoadmapItem[];
  low_priority: SkillRoadmapItem[];
  thirty_day_plan: WeeklyRoadmap[];
}

export interface ATSScoreBreakdown {
  formatting_score: number;
  section_headings_score: number;
  contact_info_score: number;
  parsing_quality_score: number;
  keyword_alignment_score: number;
}

export interface ATSFormattingCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail' | string;
  detail: string;
}

export interface ATSCompatibilityScore {
  overall_score: number;
  category: string;
  explanation: string;
  breakdown: ATSScoreBreakdown;
  formatting_warnings: string[];
  missing_sections: string[];
  detected_sections: string[];
  checks: ATSFormattingCheck[];
  keyword_coverage_percent: number;
  found_keywords_count: number;
  total_keywords_count: number;
  recommendations: string[];
  disclaimer: string;
}

export interface ResumeAnalysisResponse {
  candidate_name?: string;
  filename: string;
  selected_role: string;
  job_title: string;
  match_score: JobMatchScore;
  ats_score: ATSCompatibilityScore;
  skills_analysis: SkillsAnalysis;
  keyword_analysis: KeywordAnalysis;
  strengths: ResumeStrengths;
  improvement_areas: ImprovementAreas;
  bullet_improvements: BulletImprovement[];
  skill_gap_roadmap: SkillGapRoadmap;
  personalized_recommendations: string[];
  created_at: string;
}

export type SupportedRole =
  | 'Software Developer'
  | 'Data Analyst'
  | 'AI/ML Engineer'
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Full Stack Developer'
  | 'Other';
