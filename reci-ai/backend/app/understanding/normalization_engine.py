from typing import List
from app.understanding.skill_taxonomy import taxonomy
from app.understanding.utils import clean_text

class NormalizationEngine:
    @staticmethod
    def normalize_skill(skill: str) -> str:
        """
        Normalize standard raw skills (e.g. JavaScript, AWS, node) into canonical forms.
        """
        cleaned = clean_text(skill)
        canonical = taxonomy.get_canonical(cleaned)
        if canonical:
            return canonical
        return cleaned

    @staticmethod
    def normalize_skills_list(skills: List[str]) -> List[str]:
        """
        Normalize a full list of raw skills and remove duplicates while keeping order.
        """
        if not skills:
            return []
            
        normalized_list = []
        seen = set()
        for s in skills:
            norm = NormalizationEngine.normalize_skill(s)
            if norm and norm.lower() not in seen:
                normalized_list.append(norm)
                seen.add(norm.lower())
        return normalized_list
