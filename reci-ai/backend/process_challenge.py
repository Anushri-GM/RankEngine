import os
import json
import time
import docx
from typing import List, Dict, Any

# Ensure we can import from backend app package
import sys
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.understanding.job_understanding import JobUnderstandingEngine
from app.understanding.candidate_understanding import CandidateUnderstandingEngine
from app.understanding.behavior_understanding import BehaviorUnderstanding
from app.understanding.validation_engine import ValidationEngine

def main():
    print("==================================================")
    # Correct paths relative to PROJECTS/rankengine workspace root
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    jd_path = os.path.join(base_dir, "extracted_data", "[PUB] India_runs_data_and_ai_challenge", "India_runs_data_and_ai_challenge", "job_description.docx")
    sample_candidates_path = os.path.join(base_dir, "extracted_data", "[PUB] India_runs_data_and_ai_challenge", "India_runs_data_and_ai_challenge", "sample_candidates.json")
    full_candidates_path = os.path.join(base_dir, "extracted_data", "[PUB] India_runs_data_and_ai_challenge", "India_runs_data_and_ai_challenge", "candidates.jsonl")
    
    outputs_dir = os.path.join(os.path.dirname(__file__), "outputs")
    os.makedirs(outputs_dir, exist_ok=True)
    
    print(f"Base Directory: {base_dir}")
    print(f"JD Path: {jd_path}")
    print(f"Sample Candidates Path: {sample_candidates_path}")
    print(f"Full Candidates Path: {full_candidates_path}")
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

    # 2. Process Sample Candidates (50 profiles)
    print("\n--- 2. Parsing Sample Candidates ---")
    if not os.path.exists(sample_candidates_path):
        print(f"Error: Sample Candidates file not found at {sample_candidates_path}")
        return
        
    start_time = time.time()
    try:
        with open(sample_candidates_path, "r", encoding="utf-8") as f:
            raw_candidates = json.load(f)
            
        print(f"Loaded {len(raw_candidates)} sample profiles. Validating...")
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
            processed_candidates.append(cand_intel.dict())
            behavior_profiles.append(profile.dict())
            
        candidate_output_path = os.path.join(outputs_dir, "candidate_intelligence.json")
        with open(candidate_output_path, "w", encoding="utf-8") as out_f:
            json.dump(processed_candidates, out_f, indent=2)
            
        behavior_output_path = os.path.join(outputs_dir, "behavior_profiles.json")
        with open(behavior_output_path, "w", encoding="utf-8") as out_f:
            json.dump(behavior_profiles, out_f, indent=2)
            
        print(f"Success: Processed {len(raw_candidates)} sample candidates in {time.time() - start_time:.3f} seconds.")
        print(f"Candidate Intelligence saved to: {candidate_output_path}")
        print(f"Behavior Profiles saved to: {behavior_output_path}")
    except Exception as e:
        print(f"Failed to process sample candidates: {str(e)}")
        import traceback
        traceback.print_exc()

    # 3. Process Slice of Full Candidates JSONL
    print("\n--- 3. Ingesting Portion of Full candidates.jsonl ---")
    if not os.path.exists(full_candidates_path):
        print(f"Warning: Full candidates.jsonl not found at {full_candidates_path}")
        return
        
    start_time = time.time()
    try:
        limit = 1000
        count = 0
        jsonl_candidates = []
        
        print(f"Reading up to {limit} candidates from candidates.jsonl...")
        with open(full_candidates_path, "r", encoding="utf-8") as f:
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
            processed_jsonl.append(cand_intel.dict())
            behavior_jsonl.append(profile.dict())
            
        jsonl_candidates_output_path = os.path.join(outputs_dir, "candidates_jsonl_intelligence.json")
        with open(jsonl_candidates_output_path, "w", encoding="utf-8") as out_f:
            json.dump(processed_jsonl, out_f, indent=2)
            
        jsonl_behavior_output_path = os.path.join(outputs_dir, "candidates_jsonl_behaviors.json")
        with open(jsonl_behavior_output_path, "w", encoding="utf-8") as out_f:
            json.dump(behavior_jsonl, out_f, indent=2)
            
        print(f"Success: Processed {limit} candidates from jsonl in {time.time() - start_time:.3f} seconds.")
        print(f"Outputs written to {outputs_dir}/")
    except Exception as e:
        print(f"Failed to process candidates.jsonl: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
