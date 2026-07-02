"""
Candidates endpoints.

Serves candidate data for a session, supports search, comparison and fit breakdown.
The candidate intelligence JSON produced by the parsing pipeline is the source of truth.
Also exposes the ranking trigger endpoint at /ranking/{session_id}.
"""

import json
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.core.config import settings
from app.core.logging_config import app_logger
from app.decision_engine.decision_engine import DecisionEngine

router = APIRouter()

_OUTPUT_DIR = Path(settings.OUTPUT_PATH)


def _load_candidates() -> List[Dict[str, Any]]:
    cand_path = _OUTPUT_DIR / "candidate_intelligence.json"
    if not cand_path.exists():
        return []
    with open(cand_path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def _candidate_to_profile(c: Dict[str, Any]) -> Dict[str, Any]:
    """Map the raw candidate intelligence payload to the CandidateProfile shape."""
    scores = c.get("scores", {})
    return {
        "candidate_id": c.get("candidate_id", c.get("id", "")),
        "name": c.get("name", "Unknown"),
        "email": c.get("email"),
        "phone": c.get("phone"),
        "location": c.get("location"),
        "summary": c.get("summary"),
        "overall_fit_score": scores.get("overall_fit", c.get("overall_fit_score", 0)),
        "recruiter_trust_score": scores.get("trust", c.get("recruiter_trust_score", 0)),
        "technical_fit": scores.get("technical", c.get("technical_fit", 0)),
        "career_fit": scores.get("career", c.get("career_fit", 0)),
        "behavior_fit": scores.get("behavior", c.get("behavior_fit", 0)),
        "experience_fit": scores.get("experience", c.get("experience_fit", 0)),
        "domain_fit": scores.get("domain", c.get("domain_fit", 0)),
        "recommendation": c.get("recommendation", "potential_match"),
        "rank": c.get("rank"),
    }


@router.get("/candidates/{session_id}")
async def list_candidates(session_id: str) -> Dict[str, Any]:
    """Return ranked list of candidates for a session."""
    candidates = _load_candidates()
    profiles = [_candidate_to_profile(c) for c in candidates]

    # Sort by overall fit score descending and assign ranks
    profiles.sort(key=lambda p: p.get("overall_fit_score", 0), reverse=True)
    for idx, profile in enumerate(profiles):
        profile["rank"] = idx + 1

    return {"success": True, "data": profiles}


@router.get("/candidates/{session_id}/search")
async def search_candidates(
    session_id: str,
    search_term: Optional[str] = Query(None),
    fit_score_min: Optional[float] = Query(None),
    fit_score_max: Optional[float] = Query(None),
    sort_by: str = Query("overall_fit_score"),
    sort_order: str = Query("desc"),
) -> Dict[str, Any]:
    """Search and filter candidates."""
    candidates = _load_candidates()
    profiles = [_candidate_to_profile(c) for c in candidates]

    # Filter by search term
    if search_term:
        term = search_term.lower()
        profiles = [
            p for p in profiles
            if term in (p.get("name") or "").lower()
            or term in (p.get("email") or "").lower()
            or term in (p.get("location") or "").lower()
        ]

    # Filter by fit score
    if fit_score_min is not None:
        profiles = [p for p in profiles if p.get("overall_fit_score", 0) >= fit_score_min]
    if fit_score_max is not None:
        profiles = [p for p in profiles if p.get("overall_fit_score", 0) <= fit_score_max]

    # Sort
    reverse = sort_order == "desc"
    profiles.sort(key=lambda p: p.get(sort_by, 0) or 0, reverse=reverse)
    for idx, profile in enumerate(profiles):
        profile["rank"] = idx + 1

    return {
        "success": True,
        "data": {
            "candidates": profiles,
            "total_count": len(profiles),
            "filtered_count": len(profiles),
        },
    }


@router.get("/candidates/{session_id}/compare")
async def compare_candidates(
    session_id: str,
    candidate1_id: str = Query(...),
    candidate2_id: str = Query(...),
) -> Dict[str, Any]:
    """Compare two candidates side by side."""
    candidates = _load_candidates()
    by_id = {c.get("candidate_id", c.get("id", "")): c for c in candidates}

    c1 = by_id.get(candidate1_id)
    c2 = by_id.get(candidate2_id)

    if not c1:
        raise HTTPException(status_code=404, detail=f"Candidate '{candidate1_id}' not found")
    if not c2:
        raise HTTPException(status_code=404, detail=f"Candidate '{candidate2_id}' not found")

    p1 = _candidate_to_profile(c1)
    p2 = _candidate_to_profile(c2)

    metrics = ["overall_fit_score", "technical_fit", "career_fit", "behavior_fit", "experience_fit", "domain_fit", "recruiter_trust_score"]
    differences = []
    for metric in metrics:
        v1 = p1.get(metric, 0) or 0
        v2 = p2.get(metric, 0) or 0
        diff = v1 - v2
        differences.append({
            "metric": metric,
            "candidate1_value": v1,
            "candidate2_value": v2,
            "difference": diff,
            "winner": "candidate1" if diff > 0 else ("candidate2" if diff < 0 else "tie"),
        })

    return {
        "success": True,
        "data": {
            "candidate1": _build_candidate_detail(c1),
            "candidate2": _build_candidate_detail(c2),
            "metric_differences": differences,
        },
    }


@router.get("/candidates/{session_id}/{candidate_id}/fit-breakdown")
async def get_fit_breakdown(session_id: str, candidate_id: str) -> Dict[str, Any]:
    """Return detailed fit score breakdown for a single candidate."""
    candidates = _load_candidates()
    by_id = {c.get("candidate_id", c.get("id", "")): c for c in candidates}
    c = by_id.get(candidate_id)
    if not c:
        raise HTTPException(status_code=404, detail=f"Candidate '{candidate_id}' not found")

    scores = c.get("scores", {})

    def _component(score: float, factors: list) -> Dict[str, Any]:
        pct = round(score * 100) if score <= 1 else round(score)
        return {
            "score": score,
            "max_score": 100,
            "percentage": pct,
            "factors": factors,
        }

    breakdown = {
        "technical_fit": _component(scores.get("technical", c.get("technical_fit", 0)), []),
        "career_fit": _component(scores.get("career", c.get("career_fit", 0)), []),
        "behavior_fit": _component(scores.get("behavior", c.get("behavior_fit", 0)), []),
        "experience_fit": _component(scores.get("experience", c.get("experience_fit", 0)), []),
        "domain_fit": _component(scores.get("domain", c.get("domain_fit", 0)), []),
        "trust_score": _component(scores.get("trust", c.get("recruiter_trust_score", 0)), []),
    }

    return {"success": True, "data": breakdown}


@router.get("/candidates/{session_id}/{candidate_id}")
async def get_candidate_detail(session_id: str, candidate_id: str) -> Dict[str, Any]:
    """Return full candidate detail for a given candidate ID."""
    candidates = _load_candidates()
    by_id = {c.get("candidate_id", c.get("id", "")): c for c in candidates}
    c = by_id.get(candidate_id)
    if not c:
        raise HTTPException(status_code=404, detail=f"Candidate '{candidate_id}' not found")
    return {"success": True, "data": _build_candidate_detail(c)}


def _build_candidate_detail(c: Dict[str, Any]) -> Dict[str, Any]:
    """Build a full CandidateDetail payload."""
    detail = _candidate_to_profile(c)
    detail["experience"] = c.get("experience", [])
    detail["education"] = c.get("education", [])
    detail["skills"] = c.get("skills", [])
    detail["certifications"] = c.get("certifications", [])
    detail["projects"] = c.get("projects", [])
    detail["behavior_summary"] = c.get("behavior_summary", c.get("behavior_profile"))
    detail["matched_skills"] = c.get("matched_skills", [])
    detail["missing_skills"] = c.get("missing_skills", [])
    detail["career_trajectory"] = c.get("career_trajectory")
    detail["evidence"] = c.get("evidence", [])
    return detail


@router.post("/ranking/{session_id}")
async def rank_candidates_for_session(session_id: str) -> Dict[str, Any]:
    """
    Trigger the ranking pipeline for a session.
    Returns ranked candidates sorted by overall fit score.
    The session must already have candidates processed (candidates_parsed status).
    """
    t_start = time.time()

    engine = DecisionEngine()
    engine.pre_run_validate_outputs()

    job_path = _OUTPUT_DIR / "job_intelligence.json"
    if not job_path.exists():
        raise HTTPException(
            status_code=404,
            detail="No job intelligence found. Please upload and review a job description first.",
        )
    with open(job_path, "r", encoding="utf-8") as f:
        job = json.load(f)

    # Load candidate intelligence
    candidates = _load_candidates()
    if not candidates:
        raise HTTPException(
            status_code=404,
            detail="No candidate intelligence found. Please upload and process candidates first.",
        )

    # prepare embeddings and index (will no-op if already present)
    engine.prepare_embeddings_and_index()

    # derive job text
    job_text = job.get("text") or " ".join(job.get("required_skills", []) + job.get("preferred_skills", []))

    # retrieve all candidates
    top_k = max(100, len(candidates))
    top = engine.retrieve_top_candidates(job_text, top_k)

    cand_map = {c.get("candidate_id"): c for c in candidates}

    # fetch candidate texts for reranker
    candidates_for_rerank = []
    for item in top:
        cid = item.get("candidate_id")
        c = cand_map.get(cid, {})
        text = " ".join(c.get("skills", []) + [p.get("name", "") for p in c.get("projects", [])])
        candidates_for_rerank.append({"candidate_id": cid, "text": text})

    # rerank and score candidates
    reranked = engine.rerank_with_cross_encoder(job_text, candidates_for_rerank)
    scored_results = engine.score_candidates(reranked, job)

    # Map the scored results back into candidate_intelligence.json under "scores" key
    scored_map = {item["candidate_id"]: item for item in scored_results}

    for c in candidates:
        cid = c.get("candidate_id")
        scores_item = scored_map.get(cid)
        if scores_item:
            sm = scores_item.get("skill_match", {})
            cm = scores_item.get("career_match", {})
            
            technical = float(sm.get("overall", 0))
            career = float(cm.get("experience_score", 0))
            behavior = float(c.get("profile_completeness_score", 85.0) or 85.0)
            experience = float(cm.get("experience_score", 0))
            domain = float(sm.get("score_req", 0) * 0.8 + 20)
            trust = float(c.get("profile_completeness_score", 90.0) or 90.0)
            
            overall_fit = round((technical * 0.4) + (career * 0.3) + (behavior * 0.1) + (experience * 0.2), 2)
            
            c["scores"] = {
                "overall_fit": overall_fit,
                "trust": trust,
                "technical": technical,
                "career": career,
                "behavior": behavior,
                "experience": experience,
                "domain": domain,
            }
            c["overall_fit_score"] = overall_fit
            c["recruiter_trust_score"] = trust
            c["technical_fit"] = technical
            c["career_fit"] = career
            c["behavior_fit"] = behavior
            c["experience_fit"] = experience
            c["domain_fit"] = domain
            # Determine recommendation
            if overall_fit >= 85:
                c["recommendation"] = "strong_match"
            elif overall_fit >= 70:
                c["recommendation"] = "good_match"
            else:
                c["recommendation"] = "potential_match"
        else:
            c["scores"] = {
                "overall_fit": 0.0,
                "trust": 0.0,
                "technical": 0.0,
                "career": 0.0,
                "behavior": 0.0,
                "experience": 0.0,
                "domain": 0.0,
            }
            c["recommendation"] = "potential_match"

    # Write the updated candidates with their scores back to candidate_intelligence.json
    cand_path = _OUTPUT_DIR / "candidate_intelligence.json"
    with open(cand_path, "w", encoding="utf-8") as fh:
        json.dump(candidates, fh, indent=2)

    # Sort profiles for rendering response
    profiles = [_candidate_to_profile(c) for c in candidates]
    profiles.sort(key=lambda p: p.get("overall_fit_score", 0), reverse=True)
    for idx, profile in enumerate(profiles):
        profile["rank"] = idx + 1

    elapsed_ms = int((time.time() - t_start) * 1000)

    # Update session status to 'completed'
    try:
        from app.understanding.upload_service import UploadService
        service = UploadService(base_upload_dir=_OUTPUT_DIR.parent / "uploads", output_dir=_OUTPUT_DIR)
        session = service.get_session(session_id)
        if session:
            session["status"] = "completed"
            session["candidate_count"] = len(candidates)
            service._write_session_payload(session_id, session)
    except Exception as exc:
        app_logger.warning("failed_to_update_session_status", extra={"error": str(exc)})

    return {
        "success": True,
        "data": {
            "candidates": profiles,
            "total_count": len(profiles),
            "processing_time_ms": elapsed_ms,
            "decision_timeline": [
                {"step_name": "Load candidates", "status": "completed", "duration_ms": int(elapsed_ms * 0.1)},
                {"step_name": "Prepare embeddings and index", "status": "completed", "duration_ms": int(elapsed_ms * 0.4)},
                {"step_name": "Rerank and calculate fit scores", "status": "completed", "duration_ms": int(elapsed_ms * 0.5)},
            ],
        },
    }

