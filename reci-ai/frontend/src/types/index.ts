// Session Management
export interface HiringSession {
  session_id: string;
  role_title: string;
  created_at: string;
  updated_at: string;
  status: 'new' | 'job_uploaded' | 'job_reviewed' | 'processing' | 'completed' | 'error';
  candidate_count?: number;
  processing_status?: ProcessingStatus;
}

export interface ProcessingStatus {
  stage: string;
  progress: number;
  current_step: string;
  estimated_time_remaining?: number;
  start_time?: string;
  end_time?: string;
}

// Job Understanding
export interface JobUnderstanding {
  role_title: string;
  industry?: string;
  experience_required?: string;
  required_skills: Skill[];
  preferred_skills: Skill[];
  soft_skills?: string[];
  responsibilities?: string[];
  education_requirement?: string;
  location?: string;
  role_category?: string;
  salary_range?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  key_requirements?: string[];
}

export interface Skill {
  name: string;
  proficiency?: 'beginner' | 'intermediate' | 'expert';
  importance?: 'critical' | 'important' | 'nice_to_have';
}

// Candidate Profile
export interface CandidateProfile {
  candidate_id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  overall_fit_score: number;
  recruiter_trust_score: number;
  technical_fit: number;
  career_fit: number;
  behavior_fit: number;
  experience_fit: number;
  domain_fit: number;
  recommendation: 'strong_match' | 'good_match' | 'potential_match' | 'weak_match';
  rank?: number;
}

// Detailed Candidate Data
export interface CandidateDetail extends CandidateProfile {
  experience: Experience[];
  education: Education[];
  skills: CandidateSkill[];
  certifications: Certification[];
  projects: Project[];
  behavior_summary?: BehaviorSummary;
  matched_skills: MatchedSkill[];
  missing_skills: Skill[];
  career_trajectory?: CareerTrajectory;
  evidence?: Evidence[];
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description?: string;
  skills?: string[];
  start_date?: string;
  end_date?: string;
  current?: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduation_date?: string;
  gpa?: string;
}

export interface CandidateSkill {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'expert';
  experience_years?: number;
  last_used?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date_obtained?: string;
  expiry_date?: string;
  url?: string;
}

export interface Project {
  title: string;
  description?: string;
  technologies?: string[];
  url?: string;
  role?: string;
}

export interface BehaviorSummary {
  leadership?: number;
  collaboration?: number;
  problem_solving?: number;
  communication?: number;
  adaptability?: number;
  initiative?: number;
  traits?: string[];
}

export interface MatchedSkill {
  skill_name: string;
  proficiency: string;
  match_type: 'exact' | 'similar' | 'related';
  evidence: SkillEvidence[];
}

export interface SkillEvidence {
  source_type: 'project' | 'experience' | 'certification' | 'education';
  source_name: string;
  description?: string;
  verified: boolean;
}

export interface CareerTrajectory {
  current_level: string;
  trajectory: 'ascending' | 'stable' | 'lateral';
  average_tenure_months?: number;
  industry_transitions?: number;
}

export interface Evidence {
  category: string;
  items: EvidenceItem[];
}

export interface EvidenceItem {
  title: string;
  description: string;
  source: string;
  timestamp?: string;
  verified: boolean;
}

// Fit Score Breakdown
export interface FitScoreBreakdown {
  technical_fit: FitComponent;
  career_fit: FitComponent;
  behavior_fit: FitComponent;
  experience_fit: FitComponent;
  domain_fit: FitComponent;
  trust_score: FitComponent;
}

export interface FitComponent {
  score: number;
  max_score: number;
  percentage: number;
  factors: FitFactor[];
  explanation?: string;
}

export interface FitFactor {
  name: string;
  contribution: number;
  description?: string;
}

// Ranking & Processing
export interface RankingResult {
  candidates: CandidateProfile[];
  total_count: number;
  processing_time_ms: number;
  decision_timeline: DecisionStep[];
}

export interface DecisionStep {
  step_name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  duration_ms?: number;
  details?: string;
  output_count?: number;
}

// Search & Filter
export interface SearchFilters {
  search_term?: string;
  fit_score_min?: number;
  fit_score_max?: number;
  trust_score_min?: number;
  trust_score_max?: number;
  experience_min?: number;
  experience_max?: number;
  skills?: string[];
  behavior_score_min?: number;
  career_score_min?: number;
  sort_by?: 'fit_score' | 'trust_score' | 'experience' | 'name' | 'technical_fit' | 'career_fit';
  sort_order?: 'asc' | 'desc';
}

export interface SearchResult {
  candidates: CandidateProfile[];
  total_count: number;
  filtered_count: number;
}

// Comparison
export interface ComparisonData {
  candidate1: CandidateDetail;
  candidate2: CandidateDetail;
  metric_differences: MetricDifference[];
}

export interface MetricDifference {
  metric: string;
  candidate1_value: number | string;
  candidate2_value: number | string;
  difference: number;
  winner: 'candidate1' | 'candidate2' | 'tie';
}

// Analytics & Insights
export interface RecruitingInsights {
  score_distribution: ScoreDistribution;
  experience_distribution: ExperienceDistribution;
  skill_distribution: SkillFrequency[];
  behavior_distribution: BehaviorDistribution;
  trust_distribution: TrustDistribution;
  top_skills: SkillFrequency[];
  average_experience_years: number;
  average_fit_score: number;
  processing_time_ms: number;
  total_candidates_analyzed: number;
}

export interface ScoreDistribution {
  bins: number[];
  counts: number[];
  average: number;
  median: number;
  std_dev: number;
}

export interface ExperienceDistribution {
  junior_0_2: number;
  mid_2_5: number;
  senior_5_10: number;
  lead_10_plus: number;
}

export interface SkillFrequency {
  skill: string;
  frequency: number;
  average_proficiency: string;
}

export interface BehaviorDistribution {
  leadership: number;
  collaboration: number;
  problem_solving: number;
  communication: number;
  adaptability: number;
  initiative: number;
}

export interface TrustDistribution {
  high_trust_75_plus: number;
  good_trust_60_75: number;
  moderate_trust_40_60: number;
  low_trust_below_40: number;
}

// Export
export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  include_rankings: boolean;
  include_fit_scores: boolean;
  include_trust_scores: boolean;
  include_evidence: boolean;
  include_matched_skills: boolean;
  include_missing_skills: boolean;
}

export interface ExportResult {
  success: boolean;
  file_url?: string;
  message?: string;
  error?: string;
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse {
  session_id: string;
  file_name: string;
  file_type: 'job_description' | 'candidate_dataset';
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  message?: string;
}

// UI State
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// Legacy - Keep for backwards compatibility
export interface Candidate {
  id: string;
  name: string;
  role: string;
  experience: string;
  skills: string[];
  status: 'success' | 'warning' | 'info' | 'danger';
  statusLabel: string;
  score: number;
}
