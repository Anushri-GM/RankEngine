from typing import List, Dict, Any
from app.understanding.skill_taxonomy import taxonomy


class SkillMatchEngine:
    @staticmethod
    def match(required: List[str], preferred: List[str], candidate_skills: List[str]) -> Dict[str, Any]:
        normalized_candidate = [s.lower() for s in (candidate_skills or [])]

        def _canonical_list(skills):
            out = []
            for s in skills or []:
                c = taxonomy.get_canonical(s) or s
                out.append(c)
            return list(dict.fromkeys(out))

        req_canon = _canonical_list(required)
        pref_canon = _canonical_list(preferred)
        cand_canon = _canonical_list(candidate_skills)

        matched = [s for s in req_canon if s in cand_canon]
        missing = [s for s in req_canon if s not in cand_canon]

        preferred_matched = [s for s in pref_canon if s in cand_canon]

        score_req = (len(matched) / max(1, len(req_canon))) * 100 if req_canon else 0
        score_pref = (len(preferred_matched) / max(1, len(pref_canon))) * 100 if pref_canon else 0

        overall = round((score_req * 0.7 + score_pref * 0.3), 2)

        return {
            "match_percent": overall,
            "required_matched": matched,
            "required_missing": missing,
            "preferred_matched": preferred_matched,
        }


__all__ = ["SkillMatchEngine"]
