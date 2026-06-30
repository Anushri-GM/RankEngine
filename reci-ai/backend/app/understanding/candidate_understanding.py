from typing import Dict, Any, List
from app.understanding.schema import CandidateIntelligence
from app.understanding.normalization_engine import NormalizationEngine
from app.understanding.experience_engine import ExperienceEngine
from app.understanding.education_engine import EducationEngine
from app.understanding.project_engine import ProjectEngine
from app.understanding.certification_engine import CertificationEngine
from app.understanding.utils import clean_text

class CandidateUnderstandingEngine:
    @staticmethod
    def process_candidate(raw_candidate: Dict[str, Any]) -> CandidateIntelligence:
        """
        Transforms raw candidate data into structured CandidateIntelligence object.
        Supports both simplified format and the official Redrob Challenge dataset schema.
        """
        candidate_id = str(raw_candidate.get("candidate_id", "Unknown ID"))

        # Check if official Redrob dataset format (has nested profile object)
        if "profile" in raw_candidate and isinstance(raw_candidate["profile"], dict):
            profile = raw_candidate["profile"]
            name = clean_text(profile.get("anonymized_name", "Unknown Candidate"))
            
            # 1. Map and Normalize skills
            skills_raw = []
            for s in raw_candidate.get("skills", []):
                if isinstance(s, dict) and "name" in s:
                    skills_raw.append(s["name"])
                elif isinstance(s, str):
                    skills_raw.append(s)
            skills = NormalizationEngine.normalize_skills_list(skills_raw)
            
            # 2. Map career_history to work_history format
            work_history = []
            for job in raw_candidate.get("career_history", []):
                work_history.append({
                    "company": job.get("company", "Unknown Company"),
                    "role": job.get("title", "Software Engineer"),
                    "start_date": job.get("start_date", ""),
                    "end_date": job.get("end_date", None),
                    "description": job.get("description", "")
                })
            timeline = ExperienceEngine.analyze_timeline(work_history)
            experience_years = round(timeline.total_months / 12, 1)
            
            # 3. Parse projects (if any exist, else default empty)
            projects_raw = raw_candidate.get("projects", [])
            projects = ProjectEngine.parse_projects(projects_raw)
            
            # 4. Map education field of study to major
            education_raw = []
            for edu in raw_candidate.get("education", []):
                education_raw.append({
                    "degree": edu.get("degree", "Bachelors"),
                    "major": edu.get("field_of_study", "Computer Science"),
                    "institution": edu.get("institution", "Unknown University"),
                    "year": edu.get("end_year", 2020)
                })
            education = EducationEngine.normalize_education(education_raw)
            
            # 5. Map certifications issuer to provider
            certs_raw = []
            for cert in raw_candidate.get("certifications", []):
                certs_raw.append({
                    "certification": cert.get("name", "Certification"),
                    "provider": cert.get("issuer", ""),
                    "year": cert.get("year", 2020)
                })
            certifications = CertificationEngine.parse_certifications(certs_raw)
            
            # 6. Map languages list of dicts to list of strings
            languages = []
            for lang in raw_candidate.get("languages", []):
                if isinstance(lang, dict) and "language" in lang:
                    languages.append(lang["language"])
                elif isinstance(lang, str):
                    languages.append(lang)
            languages = [clean_text(l) for l in languages if l]
            
            # 7. Map redrob_signals to activity_metadata
            activity_metadata = raw_candidate.get("redrob_signals", {})
            if "github_activity_score" in activity_metadata:
                activity_metadata["github_contributions"] = activity_metadata["github_activity_score"]
                
        else:
            # Simplified mockup format (Part 1 style)
            name = clean_text(raw_candidate.get("name", "Unknown Candidate"))
            skills_raw = raw_candidate.get("skills", [])
            skills = NormalizationEngine.normalize_skills_list(skills_raw)
            
            work_history = raw_candidate.get("work_history", [])
            timeline = ExperienceEngine.analyze_timeline(work_history)
            experience_years = round(timeline.total_months / 12, 1)

            projects_raw = raw_candidate.get("projects", [])
            projects = ProjectEngine.parse_projects(projects_raw)

            education_raw = raw_candidate.get("education", [])
            education = EducationEngine.normalize_education(education_raw)

            certs_raw = raw_candidate.get("certifications", [])
            certifications = CertificationEngine.parse_certifications(certs_raw)

            languages = [clean_text(lang) for lang in raw_candidate.get("languages", []) if lang]
            activity_metadata = raw_candidate.get("activity_metadata", {})

        return CandidateIntelligence(
            candidate_id=candidate_id,
            name=name,
            experience_years=experience_years,
            career_timeline=timeline,
            skills=skills,
            projects=projects,
            education=education,
            certifications=certifications,
            languages=languages,
            activity_metadata=activity_metadata
        )
