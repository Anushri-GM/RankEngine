from typing import Dict, Any


class CareerMatchEngine:
    @staticmethod
    def score(candidate: Any, job_intel: Dict[str, Any]) -> Dict[str, Any]:
        # candidate expected to have experience_years attribute or nested experience dictionary
        cand_years = getattr(candidate, "experience_years", 0) or 0
        if not cand_years:
            experience_obj = getattr(candidate, "experience", None)
            if isinstance(experience_obj, dict):
                cand_years = experience_obj.get("years", 0) or 0
            elif hasattr(experience_obj, "years"):
                cand_years = getattr(experience_obj, "years", 0) or 0

        # job expected to have experience dictionary or experience_requirement dictionary
        job_years = job_intel.get("experience", {}).get("min_years", 0) or 0
        if not job_years:
            exp_req = job_intel.get("experience_requirement", None)
            if isinstance(exp_req, dict):
                job_years = exp_req.get("years", 0) or 0
            elif hasattr(exp_req, "years"):
                job_years = getattr(exp_req, "years", 0) or 0

        # simple experience score
        exp_score = 100 if cand_years >= job_years else round((cand_years / max(1, job_years)) * 100, 2)

        # role progression naive check: reward >5 years
        progression = 10 if cand_years >= 5 else 0

        score = round(min(100, exp_score * 0.8 + progression), 2)

        return {"experience_years": cand_years, "experience_score": score}


__all__ = ["CareerMatchEngine"]
