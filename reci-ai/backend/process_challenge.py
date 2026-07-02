import os
import json
import time
import docx
from typing import List, Dict, Any

# Ensure we can import from backend app package
import sys
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.core.config import settings
from app.understanding.job_understanding import JobUnderstandingEngine
from app.understanding.candidate_understanding import CandidateUnderstandingEngine
from app.understanding.behavior_understanding import BehaviorUnderstanding
from app.understanding.validation_engine import ValidationEngine
from app.understanding.parser_metadata import ParserMetadataEngine

def main():
    print("==================================================")
    # Correct paths relative to PROJECTS/rankengine workspace root
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    jd_path = os.path.join(base_dir, "extracted_data", "[PUB] India_runs_data_and_ai_challenge", "India_runs_data_and_ai_challenge", "job_description.docx")
    outputs_dir = settings.OUTPUT_PATH
    os.makedirs(outputs_dir, exist_ok=True)
    
    print(f"Base Directory: {base_dir}")
    print(f"JD Path: {jd_path}")
    print("==================================================")
    
    # 1. Process Job Description
    print("\n--- 1. Parsing Job Description ---")
    if not os.path.exists(jd_path):
        print(f"Error: Job Description file not found at {jd_path}")
        return
        
    start_time = time.time()
    try:
        with open(jd_path, "rb") as f:
            jd_bytes = f.read()
            
        job_engine = JobUnderstandingEngine()
        text = job_engine.read_docx(jd_bytes)
        job_intel = job_engine.extract_intelligence(text)
        
        job_output_path = os.path.join(outputs_dir, "job_intelligence.json")
        with open(job_output_path, "w", encoding="utf-8") as out_f:
            json.dump(job_intel.dict(), out_f, indent=2)
            
        print(f"Success: Job Description processed in {time.time() - start_time:.3f} seconds.")
        print(f"Role: {job_intel.role.title} ({job_intel.role.category} - {job_intel.role.seniority})")
        print(f"Required Skills normalized: {', '.join(job_intel.required_skills)}")
        print(f"Inferred Expectations: {', '.join(job_intel.inferred_expectations)}")
        print(f"Output saved to: {job_output_path}")
    except Exception as e:
        print(f"Failed to process Job Description: {str(e)}")
        return

    # 2. Process detected candidate dataset
    print("\n--- 2. Parsing Detected Candidate Dataset ---")
    dataset_path, _ = ParserMetadataEngine.discover_candidate_dataset(base_dir=base_dir)
    if not dataset_path.exists():
        print(f"Error: No candidate dataset found under the workspace search roots.")
        return

    start_time = time.time()
    try:
        raw_candidates = ParserMetadataEngine.load_candidates_from_path(dataset_path)
        if not raw_candidates:
            print(f"Error: No candidates could be loaded from detected dataset: {dataset_path}")
            return

        print(f"Loaded {len(raw_candidates)} profiles from {dataset_path}. Validating...")
        validation_report = ValidationEngine.validate_candidate_dataset(raw_candidates)
        
        report_output_path = os.path.join(outputs_dir, "validation_report.json")
        with open(report_output_path, "w", encoding="utf-8") as out_f:
            json.dump(validation_report.dict(), out_f, indent=2)
        print(f"Validation Status: {validation_report.status}")
        
        processed_candidates = []
        behavior_profiles = []
        
        for cand in raw_candidates:
            cand_intel = CandidateUnderstandingEngine.process_candidate(cand)
            profile = BehaviorUnderstanding.generate_profile(cand_intel, validation_report.status)
            processed_candidates.append(cand_intel)
            behavior_profiles.append(profile)
            
        ParserMetadataEngine.generate_artifacts(
            candidates=raw_candidates,
            processed_candidates=processed_candidates,
            behavior_profiles=behavior_profiles,
            validation_report=validation_report,
            dataset_path=dataset_path,
            output_dir=outputs_dir,
            job_intelligence=job_intel.dict() if 'job_intel' in locals() else None,
        )

        candidate_output_path = os.path.join(outputs_dir, "candidate_intelligence.json")
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
        with open(candidate_output_path, "w", encoding="utf-8") as out_f:
            json.dump(enhanced_candidates, out_f, indent=2)
            
        behavior_output_path = os.path.join(outputs_dir, "behavior_profiles.json")
        with open(behavior_output_path, "w", encoding="utf-8") as out_f:
            json.dump([profile.dict() for profile in behavior_profiles], out_f, indent=2)
            
        print(f"Success: Processed {len(raw_candidates)} candidates in {time.time() - start_time:.3f} seconds.")
        print(f"Candidate Intelligence saved to: {candidate_output_path}")
        print(f"Behavior Profiles saved to: {behavior_output_path}")
    except Exception as e:
        print(f"Failed to process candidate dataset: {str(e)}")
        import traceback
        traceback.print_exc()

    # 3. Optional slice of a discovered JSONL file if present
    print("\n--- 3. Checking for Additional Candidate JSONL Dataset ---")
    dataset_dir = os.path.dirname(dataset_path)
    jsonl_candidates_path = None
    for candidate in os.listdir(dataset_dir):
        if candidate.endswith(".jsonl"):
            jsonl_candidates_path = os.path.join(dataset_dir, candidate)
            break

    if not jsonl_candidates_path or not os.path.exists(jsonl_candidates_path):
        print("Warning: No additional JSONL candidate dataset discovered; skipping batch export.")
    else:
        start_time = time.time()
        try:
            limit = 1000
            count = 0
            jsonl_candidates = []
            
            print(f"Reading up to {limit} candidates from {jsonl_candidates_path}...")
            with open(jsonl_candidates_path, "r", encoding="utf-8") as f:
                for line in f:
                    if count >= limit:
                        break
                    line = line.strip()
                    if not line:
                        continue
                    jsonl_candidates.append(json.loads(line))
                    count += 1
                    
            print(f"Loaded {len(jsonl_candidates)} records from jsonl. Running validation...")
            validation_report_jsonl = ValidationEngine.validate_candidate_dataset(jsonl_candidates)
            
            processed_jsonl = []
            behavior_jsonl = []
            
            for cand in jsonl_candidates:
                cand_intel = CandidateUnderstandingEngine.process_candidate(cand)
                profile = BehaviorUnderstanding.generate_profile(cand_intel, validation_report_jsonl.status)
                processed_jsonl.append(cand_intel)
                behavior_jsonl.append(profile)
                
            jsonl_candidates_output_path = os.path.join(outputs_dir, "candidates_jsonl_intelligence.json")
            with open(jsonl_candidates_output_path, "w", encoding="utf-8") as out_f:
                json.dump([item.model_dump() for item in processed_jsonl], out_f, indent=2)
                
            jsonl_behavior_output_path = os.path.join(outputs_dir, "candidates_jsonl_behaviors.json")
            with open(jsonl_behavior_output_path, "w", encoding="utf-8") as out_f:
                json.dump([item.dict() for item in behavior_jsonl], out_f, indent=2)
                
            print(f"Success: Processed {limit} candidates from jsonl in {time.time() - start_time:.3f} seconds.")
            print(f"Outputs written to {outputs_dir}/")
        except Exception as e:
            print(f"Failed to process candidates.jsonl: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    main()
