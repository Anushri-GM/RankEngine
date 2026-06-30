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

router = APIRouter()
job_engine = JobUnderstandingEngine()

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
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Candidate Dataset must be a .json file")
        
    try:
        content = await file.read()
        raw_candidates = Loader.load_json_bytes(content)
        
        # 1. Run Validation Engine
        validation_report = ValidationEngine.validate_candidate_dataset(raw_candidates)
        
        # Dump validation report
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
            
        # Write to outputs/candidate_intelligence.json
        cand_path = os.path.join(settings.OUTPUT_PATH, "candidate_intelligence.json")
        with open(cand_path, "w", encoding="utf-8") as f:
            json_list = [c.model_dump() for c in processed_candidates]
            json.dump(json_list, f, indent=2)

        # Write to outputs/behavior_profiles.json
        profile_path = os.path.join(settings.OUTPUT_PATH, "behavior_profiles.json")
        with open(profile_path, "w", encoding="utf-8") as f:
            json_list = [p.model_dump() for p in behavior_profiles]
            json.dump(json_list, f, indent=2)
            
        return {
            "message": "Processed successfully",
            "candidates_count": len(processed_candidates),
            "validation_status": validation_report.status,
            "validation_report": validation_report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process Candidates: {str(e)}")

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
