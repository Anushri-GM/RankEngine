from typing import List, Dict, Any
from app.understanding.schema import CandidateProject
from app.understanding.utils import clean_text
from app.understanding.normalization_engine import NormalizationEngine

class ProjectEngine:
    @staticmethod
    def parse_projects(projects_list: List[Dict[str, Any]]) -> List[CandidateProject]:
        """
        Parses raw candidate projects, normalizes skill tags, and infers domains.
        """
        if not projects_list:
            return []

        parsed = []
        for proj in projects_list:
            name = clean_text(proj.get("name", "Unnamed Project"))
            description = clean_text(proj.get("description", ""))
            
            # Normalize Technologies list
            tech_raw = proj.get("technologies", [])
            technologies = NormalizationEngine.normalize_skills_list(tech_raw)

            role = clean_text(proj.get("role", "Software Engineer"))
            
            try:
                duration_months = int(proj.get("duration_months", 3))
            except Exception:
                duration_months = 3

            # Infer Business Domain from description
            business_domain = "Technology"
            desc_lower = description.lower()
            if any(w in desc_lower for w in ["bank", "fintech", "finance", "payment", "crypto", "trading", "wallet"]):
                business_domain = "Finance"
            elif any(w in desc_lower for w in ["health", "medical", "hospital", "clinic", "healthcare", "pharma"]):
                business_domain = "Healthcare"
            elif any(w in desc_lower for w in ["shop", "retail", "commerce", "store", "e-commerce", "marketplace"]):
                business_domain = "E-commerce"
            elif any(w in desc_lower for w in ["game", "unity", "unreal", "gaming"]):
                business_domain = "Gaming"
            elif any(w in desc_lower for w in ["social", "chat", "feed", "connect", "messenger"]):
                business_domain = "Social Media"
            elif any(w in desc_lower for w in ["education", "learn", "course", "lms", "school"]):
                business_domain = "Education"

            parsed.append(CandidateProject(
                name=name,
                description=description,
                technologies=technologies,
                role=role,
                duration_months=duration_months,
                business_domain=business_domain
            ))
        return parsed
