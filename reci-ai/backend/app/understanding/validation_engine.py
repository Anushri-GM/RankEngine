from typing import List, Dict, Any
from app.understanding.schema import ValidationReport, ValidationWarning, ValidationFailure
from app.understanding.utils import parse_date

class ValidationEngine:
    @staticmethod
    def validate_candidate_dataset(candidates: List[Dict[str, Any]]) -> ValidationReport:
        """
        Runs detailed validations on candidate dataset including structural, date, duplicates, and missing values constraints.
        """
        duplicate_ids = []
        missing_fields = []
        invalid_dates = []
        warnings = []
        failures = []
        
        seen_ids = set()
        
        for idx, candidate in enumerate(candidates):
            candidate_id = candidate.get("candidate_id")
            
            # Support both format schemas:
            if "profile" in candidate and isinstance(candidate["profile"], dict):
                profile = candidate["profile"]
                name = profile.get("anonymized_name")
                skills_raw = candidate.get("skills", [])
                skills = [s["name"] if isinstance(s, dict) and "name" in s else s for s in skills_raw]
                work_history = candidate.get("career_history", [])
                projects = candidate.get("projects", [])
            else:
                name = candidate.get("name")
                skills = candidate.get("skills", [])
                work_history = candidate.get("work_history", [])
                projects = candidate.get("projects", [])
            
            ctx = f"Candidate #{idx+1} (ID: {candidate_id or 'Missing'})"

            # 1. Validate ID
            if not candidate_id:
                failures.append(ValidationFailure(field="candidate_id", message=f"{ctx} is missing candidate_id"))
                missing_fields.append("candidate_id")
            else:
                candidate_id = str(candidate_id)
                if candidate_id in seen_ids:
                    duplicate_ids.append(candidate_id)
                    failures.append(ValidationFailure(field="candidate_id", message=f"Duplicate candidate_id found: {candidate_id}"))
                seen_ids.add(candidate_id)

            # 2. Validate Name
            if not name:
                failures.append(ValidationFailure(field="name", message=f"{ctx} is missing candidate name"))
                missing_fields.append("name")

            # 3. Validate Skills
            if not skills:
                warnings.append(ValidationWarning(field="skills", message=f"{ctx} has empty skills"))
                missing_fields.append("skills")

            # 4. Validate Work History
            if not work_history:
                warnings.append(ValidationWarning(field="work_history", message=f"{ctx} has empty work_history"))
            else:
                for j_idx, job in enumerate(work_history):
                    company = job.get("company")
                    start = job.get("start_date")
                    end = job.get("end_date")
                    
                    if not company:
                        warnings.append(ValidationWarning(field=f"work_history[{j_idx}].company", message=f"{ctx} has missing company name"))
                        
                    if not start:
                        warnings.append(ValidationWarning(field=f"work_history[{j_idx}].start_date", message=f"{ctx} has missing start_date at {company or 'Unknown Company'}"))
                    else:
                        start_dt = parse_date(start)
                        if not start_dt:
                            invalid_dates.append(start)
                            warnings.append(ValidationWarning(field=f"work_history[{j_idx}].start_date", message=f"{ctx} has unparsable start_date: '{start}'"))
                        
                        if end:
                            end_dt = parse_date(end)
                            if not end_dt:
                                invalid_dates.append(end)
                                warnings.append(ValidationWarning(field=f"work_history[{j_idx}].end_date", message=f"{ctx} has unparsable end_date: '{end}'"))
                            elif start_dt and start_dt > end_dt:
                                invalid_dates.append(f"{start} > {end}")
                                failures.append(ValidationFailure(
                                    field=f"work_history[{j_idx}].dates", 
                                    message=f"{ctx} has start_date '{start}' occurring after end_date '{end}'"
                                ))

            # 5. Validate Projects
            projects = candidate.get("projects", [])
            if not projects:
                warnings.append(ValidationWarning(field="projects", message=f"{ctx} has no projects list"))
            else:
                for p_idx, proj in enumerate(projects):
                    p_name = proj.get("name")
                    if not p_name:
                        warnings.append(ValidationWarning(field=f"projects[{p_idx}].name", message=f"{ctx} is missing project name"))

        status = "Valid"
        if failures:
            status = "Invalid"
        elif warnings:
            status = "Valid with Warnings"

        return ValidationReport(
            status=status,
            duplicate_ids=duplicate_ids,
            missing_fields=list(set(missing_fields)),
            invalid_dates=list(set(invalid_dates)),
            warnings=warnings,
            failures=failures
        )
