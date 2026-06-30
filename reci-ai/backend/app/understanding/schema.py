from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# ==========================================================
# Job Intelligence Models
# ==========================================================

class Role(BaseModel):
    title: str
    category: str
    seniority: str

class ExperienceRequirement(BaseModel):
    years: int
    description: str

class EducationRequirement(BaseModel):
    degree: str
    major: List[str]

class JobIntelligence(BaseModel):
    role: Role
    industry: str
    required_skills: List[str]
    preferred_skills: List[str]
    responsibilities: List[str]
    experience_requirement: ExperienceRequirement
    education_requirement: EducationRequirement
    employment_type: str
    location: str
    soft_skills: List[str]
    keywords: List[str]
    inferred_expectations: List[str] = Field(default_factory=list)


# ==========================================================
# Candidate Intelligence Models
# ==========================================================

class CareerTimelineItem(BaseModel):
    company: str
    role: str
    start_date: str
    end_date: Optional[str] = None
    duration_months: int
    description: Optional[str] = None
    is_promotion: bool = False

class CareerTimeline(BaseModel):
    items: List[CareerTimelineItem]
    total_months: int
    promotion_trend: str
    role_progression: List[str]
    industry_experience: List[str]
    career_stability: str

class CandidateProject(BaseModel):
    name: str
    description: str
    technologies: List[str]
    role: str
    duration_months: int
    business_domain: Optional[str] = None

class CandidateEducation(BaseModel):
    degree: str
    major: str
    institution: str
    year: int

class CandidateCertification(BaseModel):
    certification: str
    provider: str
    year: int
    category: str

class CandidateIntelligence(BaseModel):
    candidate_id: str
    name: str
    experience_years: float
    career_timeline: CareerTimeline
    skills: List[str]
    projects: List[CandidateProject]
    education: List[CandidateEducation]
    certifications: List[CandidateCertification]
    languages: List[str]
    activity_metadata: Dict[str, Any]


# ==========================================================
# Behavior Profile Model
# ==========================================================

class BehaviorProfile(BaseModel):
    candidate_id: str
    profile_completeness_score: int  # 0 to 100
    validation_status: str  # "Valid", "Valid with Warnings", "Invalid"
    skill_categories: Dict[str, List[str]]
    domain_expertise: List[str]
    career_stability: str
    project_diversity: str
    technology_adoption: str
    learning_velocity: str
    certification_frequency: str
    contribution_consistency: str
    recent_skill_growth: str
    activity_score: Optional[float] = None
    engagement_score: float
    behavior_score: int  # 0 to 100
    behavior_summary: str


# ==========================================================
# Validation Report Models
# ==========================================================

class ValidationWarning(BaseModel):
    field: str
    message: str

class ValidationFailure(BaseModel):
    field: str
    message: str

class ValidationReport(BaseModel):
    status: str  # "Valid", "Valid with Warnings", "Invalid"
    duplicate_ids: List[str]
    missing_fields: List[str]
    invalid_dates: List[str]
    warnings: List[ValidationWarning]
    failures: List[ValidationFailure]
