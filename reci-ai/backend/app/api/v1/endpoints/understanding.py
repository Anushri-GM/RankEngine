import os
import json
from fastapi import APIRouter, File, UploadFile, HTTPException
from typing import List, Dict, Any
from app.core.config import settings
from app.understanding.schema import JobIntelligence, ValidationReport
from app.understanding.job_understanding import JobUnderstandingEngine
from app.understanding.candidate_understanding import CandidateUnderstandingEngine
from app.understanding.behavior_understanding import BehaviorUnderstanding
from app.understanding.validation_engine import ValidationEngine
from app.understanding.loader import Loader
from app.understanding.parser_metadata import ParserMetadataEngine
from pathlib import Path

router = APIRouter()
job_engine = JobUnderstandingEngine()


def _write_parser_outputs(raw_candidates: List[Dict[str, Any]], processed_candidates: List[Any], behavior_profiles: List[Any], validation_report: Any, dataset_path: str | None = None) -> None:
    os.makedirs(settings.OUTPUT_PATH, exist_ok=True)
    job_path = os.path.join(settings.OUTPUT_PATH, "job_intelligence.json")
    job_payload = None
    if os.path.exists(job_path):
        with open(job_path, "r", encoding="utf-8") as handle:
            job_payload = json.load(handle)

    ParserMetadataEngine.generate_artifacts(
        candidates=raw_candidates,
        processed_candidates=processed_candidates,
        behavior_profiles=behavior_profiles,
        validation_report=validation_report,
        dataset_path=dataset_path or os.path.join(settings.OUTPUT_PATH, "dataset.json"),
        output_dir=settings.OUTPUT_PATH,
        job_intelligence=job_payload,
    )

    enhanced_candidates = []
    for idx, (candidate, profile) in enumerate(zip(processed_candidates, behavior_profiles)):
        enhanced_candidates.append(
            ParserMetadataEngine.enrich_candidate_payload(
                candidate=candidate,
                behavior_profile=profile,
                validation_status=validation_report.status,
                profile_completeness=profile.profile_completeness_score,
                index=idx,
            )
        )

    cand_path = os.path.join(settings.OUTPUT_PATH, "candidate_intelligence.json")
    with open(cand_path, "w", encoding="utf-8") as handle:
        json.dump(enhanced_candidates, handle, indent=2)

    profile_path = os.path.join(settings.OUTPUT_PATH, "behavior_profiles.json")
    with open(profile_path, "w", encoding="utf-8") as handle:
        json.dump([profile.model_dump() for profile in behavior_profiles], handle, indent=2)


@router.post("/job", response_model=JobIntelligence)
async def upload_job(file: UploadFile = File(...)):
    """
    Accepts DOCX Job Description, extracts standard intelligence, and dumps to outputs/job_intelligence.json.
    """
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Job Description must be a .docx file")
    
    try:
        content = await file.read()
        text = job_engine.read_docx(content)
        job_intel = job_engine.extract_intelligence(text)
        
        # Write to outputs/job_intelligence.json
        os.makedirs(settings.OUTPUT_PATH, exist_ok=True)
        file_path = os.path.join(settings.OUTPUT_PATH, "job_intelligence.json")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(job_intel.model_dump_json(indent=2))
            
        return job_intel
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process Job Description: {str(e)}")

@router.post("/candidates")
async def upload_candidates(file: UploadFile = File(...)):
    """
    Accepts JSON candidate dataset, validates inputs, normalizes fields, generates behavior profiles, and dumps outputs.
    """
    from pathlib import Path
    suffix = Path(file.filename).suffix.lower()
    if suffix not in [".json", ".csv", ".xlsx"]:
        raise HTTPException(status_code=400, detail="Candidate Dataset must be a .json, .csv, or .xlsx file")
        
    try:
        content = await file.read()
        if suffix == ".json":
            raw_candidates = Loader.load_json_bytes(content)
        elif suffix == ".csv":
            raw_candidates = Loader.load_csv_bytes(content)
        elif suffix == ".xlsx":
            raw_candidates = Loader.load_excel_bytes(content)
        
        # 1. Run Validation Engine
        validation_report = ValidationEngine.validate_candidate_dataset(raw_candidates)
        
        os.makedirs(settings.OUTPUT_PATH, exist_ok=True)
        report_path = os.path.join(settings.OUTPUT_PATH, "validation_report.json")
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(validation_report.model_dump_json(indent=2))

        # 2. Process Candidates & Behaviors
        processed_candidates = []
        behavior_profiles = []
        
        for cand in raw_candidates:
            cand_intel = CandidateUnderstandingEngine.process_candidate(cand)
            processed_candidates.append(cand_intel)
            
            # Generate behavior profile
            profile = BehaviorUnderstanding.generate_profile(cand_intel, validation_report.status)
            behavior_profiles.append(profile)
            
        _write_parser_outputs(raw_candidates, processed_candidates, behavior_profiles, validation_report)
            
        return {
            "message": "Processed successfully",
            "candidates_count": len(processed_candidates),
            "validation_status": validation_report.status,
            "validation_report": validation_report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process Candidates: {str(e)}")


@router.post("/candidates/auto")
async def auto_process_candidates(override_path: str | None = None):
    """
    Automatically discovers candidate dataset in workspace folders, validates, processes, and writes parser outputs.
    Optional `override_path` may point to a specific file to use instead of discovery.
    """
    try:
        dataset_path, candidates_found = ParserMetadataEngine.discover_candidate_dataset(override_path=override_path)
        dataset_path = Path(dataset_path)

        if not dataset_path.exists():
            raise HTTPException(status_code=404, detail=f"No candidate dataset found (tried: {', '.join(str(p) for p in candidates_found)})")

        raw_candidates = ParserMetadataEngine.load_candidates_from_path(dataset_path)
        if not raw_candidates:
            raise HTTPException(status_code=400, detail=f"Dataset at {str(dataset_path)} could not be parsed or contains no candidates")

        validation_report = ValidationEngine.validate_candidate_dataset(raw_candidates)

        # persist validation report
        os.makedirs(settings.OUTPUT_PATH, exist_ok=True)
        report_path = os.path.join(settings.OUTPUT_PATH, "validation_report.json")
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(validation_report.model_dump_json(indent=2))

        processed_candidates = []
        behavior_profiles = []
        for cand in raw_candidates:
            cand_intel = CandidateUnderstandingEngine.process_candidate(cand)
            processed_candidates.append(cand_intel)
            profile = BehaviorUnderstanding.generate_profile(cand_intel, validation_report.status)
            behavior_profiles.append(profile)

        _write_parser_outputs(raw_candidates, processed_candidates, behavior_profiles, validation_report, dataset_path=str(dataset_path))

        return {
            "message": "Auto-processed dataset",
            "dataset_path": str(dataset_path),
            "candidates_count": len(processed_candidates),
            "validation_status": validation_report.status,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to auto-process candidates: {str(e)}")

@router.get("/report", response_model=ValidationReport)
async def get_report():
    """
    Downloads the active validation report.
    """
    report_path = os.path.join(settings.OUTPUT_PATH, "validation_report.json")
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="No validation report generated yet. Please upload candidates first.")
        
    with open(report_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        return data

@router.get("/manifest")
async def get_manifest():
    """
    Returns the parser manifest generated for the active candidate dataset.
    """
    manifest_path = os.path.join(settings.OUTPUT_PATH, "manifest.json")
    if not os.path.exists(manifest_path):
        raise HTTPException(status_code=404, detail="No parser manifest generated yet. Please upload candidates first.")

    with open(manifest_path, "r", encoding="utf-8") as handle:
        return json.load(handle)


@router.get("/statistics")
async def get_statistics():
    """
    Returns dataset statistics generated from the active candidate dataset.
    """
    stats_path = os.path.join(settings.OUTPUT_PATH, "dataset_statistics.json")
    if not os.path.exists(stats_path):
        raise HTTPException(status_code=404, detail="No dataset statistics generated yet. Please upload candidates first.")

    with open(stats_path, "r", encoding="utf-8") as handle:
        return json.load(handle)


@router.get("/parser-report")
async def get_parser_report():
    """
    Returns the parser report generated for the active candidate dataset.
    """
    report_path = os.path.join(settings.OUTPUT_PATH, "parser_report.json")
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="No parser report generated yet. Please upload candidates first.")

    with open(report_path, "r", encoding="utf-8") as handle:
        return json.load(handle)


@router.get("/status")
async def get_status():
    """
    Returns counts and parsed status metrics.
    """
    job_path = os.path.join(settings.OUTPUT_PATH, "job_intelligence.json")
    cand_path = os.path.join(settings.OUTPUT_PATH, "candidate_intelligence.json")
    profile_path = os.path.join(settings.OUTPUT_PATH, "behavior_profiles.json")
    
    status = {
        "job_description_parsed": os.path.exists(job_path),
        "candidates_parsed": 0,
        "behavior_profiles_generated": 0
    }
    
    if os.path.exists(cand_path):
        try:
            with open(cand_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                status["candidates_parsed"] = len(data)
        except Exception:
            pass
            
    if os.path.exists(profile_path):
        try:
            with open(profile_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                status["behavior_profiles_generated"] = len(data)
        except Exception:
            pass
            
    return status
