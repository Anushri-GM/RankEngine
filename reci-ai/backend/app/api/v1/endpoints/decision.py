import os
import json
from fastapi import APIRouter, HTTPException
from app.decision_engine.decision_engine import DecisionEngine
from app.core.config import settings
from pathlib import Path

router = APIRouter()
engine = DecisionEngine()


@router.post("/rank")
async def rank_candidates(use_job_from_outputs: bool = True, top_k: int = 50):
    """
    Runs the decision intelligence pipeline to return ranked candidates.
    If `use_job_from_outputs` is True, reads `outputs/job_intelligence.json`.
    """
    # Ensure baseline outputs exist
    engine.pre_run_validate_outputs()

    job_path = Path(settings.OUTPUT_PATH) / "job_intelligence.json"
    if use_job_from_outputs:
        if not job_path.exists():
            raise HTTPException(status_code=404, detail="No job_intelligence.json in outputs")
        with open(job_path, "r", encoding="utf-8") as f:
            job = json.load(f)
    else:
        # minimal job placeholder
        job = {"required_skills": [], "preferred_skills": [], "text": ""}

    # prepare embeddings and index (will no-op if already present)
    engine.prepare_embeddings_and_index()

    # derive job text
    job_text = job.get("text") or " ".join(job.get("required_skills", []) + job.get("preferred_skills", []))

    top = engine.retrieve_top_candidates(job_text, top_k)

    # fetch candidate texts for reranker
    cand_path = Path(settings.OUTPUT_PATH) / "candidate_intelligence.json"
    if not cand_path.exists():
        raise HTTPException(status_code=404, detail="candidate_intelligence.json missing")
    with open(cand_path, "r", encoding="utf-8") as f:
        cand_list = json.load(f)
    cand_map = {c.get("candidate_id"): c for c in cand_list}

    candidates_for_rerank = []
    for item in top:
        cid = item.get("candidate_id")
        c = cand_map.get(cid, {})
        text = " ".join(c.get("skills", []) + [p.get("name", "") for p in c.get("projects", [])])
        candidates_for_rerank.append({"candidate_id": cid, "text": text})

    reranked = engine.rerank_with_cross_encoder(job_text, candidates_for_rerank)

    scored = engine.score_candidates(reranked, job)

    # write results to outputs
    out_path = Path(settings.OUTPUT_PATH) / "ranked_candidates.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(scored, f, indent=2)

    return {"count": len(scored), "results_path": str(out_path)}
