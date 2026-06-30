from typing import List, Dict, Any
from app.understanding.schema import CandidateEducation
from app.understanding.utils import clean_text

class EducationEngine:
    @staticmethod
    def normalize_education(education_list: List[Dict[str, Any]]) -> List[CandidateEducation]:
        """
        Parses raw education profiles and maps degrees/majors to standardized terms.
        """
        if not education_list:
            return []

        normalized = []
        for edu in education_list:
            degree_raw = clean_text(edu.get("degree", "Bachelors"))
            major_raw = clean_text(edu.get("major", "Computer Science"))
            institution = clean_text(edu.get("institution", "Unknown University"))
            
            try:
                year = int(edu.get("year", 2020))
            except Exception:
                year = 2020

            # Normalize Degree level
            degree = "Bachelors"
            deg_lower = degree_raw.lower()
            if any(w in deg_lower for w in ["master", "m.s.", "msc", "m.tech", "mba", "ma"]):
                degree = "Masters"
            elif any(w in deg_lower for w in ["phd", "ph.d", "doctorate"]):
                degree = "Doctorate"
            elif any(w in deg_lower for w in ["bachelor", "b.s.", "bsc", "b.tech", "b.eng", "ba"]):
                degree = "Bachelors"
            elif any(w in deg_lower for w in ["associate", "diploma", "cert"]):
                degree = "Associate / Diploma"
            else:
                degree = degree_raw

            # Normalize Major
            major = major_raw
            maj_lower = major_raw.lower()
            if "computer science" in maj_lower or "cs" == maj_lower:
                major = "Computer Science"
            elif "information technology" in maj_lower or "it" == maj_lower:
                major = "Information Technology"
            elif "software engineering" in maj_lower:
                major = "Software Engineering"
            elif "data science" in maj_lower or "analytics" in maj_lower:
                major = "Data Science"
            elif "electrical" in maj_lower or "electronics" in maj_lower:
                major = "Electrical Engineering"
            elif "business" in maj_lower or "management" in maj_lower:
                major = "Business Administration"

            normalized.append(CandidateEducation(
                degree=degree,
                major=major,
                institution=institution,
                year=year
            ))
        return normalized
