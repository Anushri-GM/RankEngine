from typing import Dict, Any


class CareerMatchEngine:
    @staticmethod
    def score(candidate: Any, job_intel: Dict[str, Any]) -> Dict[str, Any]:
        # candidate expected to have experience_years attribute
        cand_years = getattr(candidate, "experience_years", 0) or 0
        job_years = job_intel.get("experience", {}).get("min_years", 0) or 0

        # simple experience score
        exp_score = 100 if cand_years >= job_years else round((cand_years / max(1, job_years)) * 100, 2)

        # role progression naive check: reward >5 years
        progression = 10 if cand_years >= 5 else 0

        score = round(min(100, exp_score * 0.8 + progression), 2)

        return {"experience_years": cand_years, "experience_score": score}


__all__ = ["CareerMatchEngine"]
