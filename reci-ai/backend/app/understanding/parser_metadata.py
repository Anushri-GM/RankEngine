import hashlib
import json
import os
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from app.understanding.schema import ValidationReport
from app.understanding.skill_taxonomy import taxonomy


class ParserMetadataEngine:
    @staticmethod
    def discover_candidate_dataset(base_dir: Optional[Path | str] = None, override_path: Optional[str] = None) -> Tuple[Path, List[Path]]:
        workspace_root = Path(base_dir or Path(__file__).resolve().parents[3])
        if override_path:
            override = Path(override_path)
            if override.exists():
                return override.resolve(), [override.resolve()]

        search_roots = ["datasets", "input", "resources", "uploads", "data"]
        candidate_files: List[Path] = []

        for root_name in search_roots:
            root_dir = workspace_root / root_name
            if not root_dir.exists():
                continue
            for path in root_dir.rglob("*"):
                if not path.is_file():
                    continue
                if path.suffix.lower() in {".json", ".jsonl", ".csv"} and ParserMetadataEngine._looks_like_candidate_dataset(path):
                    candidate_files.append(path.resolve())

        if not candidate_files:
            for path in workspace_root.rglob("*"):
                if not path.is_file():
                    continue
                if path.suffix.lower() in {".json", ".jsonl", ".csv"} and ParserMetadataEngine._looks_like_candidate_dataset(path):
                    candidate_files.append(path.resolve())

        if not candidate_files:
            return workspace_root / "data" / "candidates.json", []

        candidate_files = sorted(candidate_files, key=lambda p: p.stat().st_size, reverse=True)
        return candidate_files[0], candidate_files

    @staticmethod
    def load_candidates_from_path(dataset_path: Path) -> List[Dict[str, Any]]:
        if not dataset_path.exists():
            return []

        suffix = dataset_path.suffix.lower()
        if suffix == ".json":
            with open(dataset_path, "r", encoding="utf-8") as handle:
                payload = json.load(handle)
            if isinstance(payload, dict):
                if "candidates" in payload and isinstance(payload["candidates"], list):
                    return payload["candidates"]
                return [payload]
            return payload

        if suffix == ".jsonl":
            candidates: List[Dict[str, Any]] = []
            with open(dataset_path, "r", encoding="utf-8") as handle:
                for line in handle:
                    line = line.strip()
                    if not line:
                        continue
                    item = json.loads(line)
                    if isinstance(item, dict):
                        candidates.append(item)
            return candidates

        if suffix == ".csv":
            import csv

            with open(dataset_path, "r", encoding="utf-8", newline="") as handle:
                rows = list(csv.DictReader(handle))
            return rows

        return []

    @staticmethod
    def generate_artifacts(
        candidates: List[Dict[str, Any]],
        processed_candidates: List[Any],
        behavior_profiles: List[Any],
        validation_report: ValidationReport,
        dataset_path: Optional[Path | str],
        output_dir: Optional[Path | str],
        job_intelligence: Optional[Dict[str, Any]] = None,
        session_id: Optional[str] = None,
    ) -> Tuple[Dict[str, Any], Dict[str, Any], List[Dict[str, Any]], List[Dict[str, Any]], Dict[str, Any]]:
        output_dir_path = Path(output_dir or Path(__file__).resolve().parents[3] / "outputs")
        output_dir_path.mkdir(parents=True, exist_ok=True)

        dataset_path_obj = Path(dataset_path) if dataset_path else None
        manifest = ParserMetadataEngine._build_manifest(candidates, validation_report, dataset_path_obj, output_dir_path, session_id=session_id)
        parser_report = ParserMetadataEngine._build_parser_report(processed_candidates, behavior_profiles, validation_report)
        skill_taxonomy = ParserMetadataEngine._build_skill_taxonomy()
        role_taxonomy = ParserMetadataEngine._build_role_taxonomy(job_intelligence, processed_candidates)
        dataset_statistics = ParserMetadataEngine._build_dataset_statistics(processed_candidates)

        ParserMetadataEngine._write_json(output_dir_path / "manifest.json", manifest)
        ParserMetadataEngine._write_json(output_dir_path / "parser_report.json", parser_report)
        ParserMetadataEngine._write_json(output_dir_path / "skill_taxonomy.json", skill_taxonomy)
        ParserMetadataEngine._write_json(output_dir_path / "role_taxonomy.json", role_taxonomy)
        ParserMetadataEngine._write_json(output_dir_path / "dataset_statistics.json", dataset_statistics)

        return manifest, parser_report, skill_taxonomy, role_taxonomy, dataset_statistics

    @staticmethod
    def enrich_candidate_payload(candidate: Any, behavior_profile: Any, validation_status: str, profile_completeness: int, index: int) -> Dict[str, Any]:
        payload = candidate.model_dump() if hasattr(candidate, "model_dump") else dict(candidate)
        payload["candidate_id"] = payload.get("candidate_id") or f"candidate-{index + 1}"
        payload["skills"] = list(candidate.skills) if getattr(candidate, "skills", None) is not None else []
        payload["projects"] = [project.model_dump() if hasattr(project, "model_dump") else dict(project) for project in (candidate.projects or [])]
        payload["experience"] = {
            "years": getattr(candidate, "experience_years", 0) or 0,
            "timeline": candidate.career_timeline.model_dump() if hasattr(candidate.career_timeline, "model_dump") else {},
        }
        payload["behavior_profile"] = behavior_profile.model_dump() if hasattr(behavior_profile, "model_dump") else dict(behavior_profile or {})
        payload["validation_status"] = validation_status or "Unknown"
        payload["profile_completeness"] = int(profile_completeness or 0)
        if not payload.get("behavior_profile"):
            payload["behavior_profile"] = {
                "candidate_id": payload["candidate_id"],
                "profile_completeness_score": 0,
                "validation_status": validation_status or "Unknown",
                "behavior_score": 0,
                "behavior_summary": "Profile not available",
            }
        return payload

    @staticmethod
    def _looks_like_candidate_dataset(path: Path) -> bool:
        excluded_dirs = {"outputs", "output", "__pycache__", ".git", "node_modules", ".venv", "venv"}
        if any(part in excluded_dirs for part in path.parts):
            return False

        if path.suffix.lower() == ".json":
            try:
                with open(path, "r", encoding="utf-8") as handle:
                    content = json.load(handle)
                if isinstance(content, list):
                    return any(isinstance(item, dict) for item in content)
                if isinstance(content, dict):
                    if isinstance(content.get("candidates"), list):
                        return True
                    return any(key in content for key in ["candidate_id", "name", "skills", "profile"])
            except Exception:
                return False

        if path.suffix.lower() == ".jsonl":
            try:
                with open(path, "r", encoding="utf-8") as handle:
                    for idx, line in enumerate(handle):
                        if idx >= 5:
                            break
                        if not line.strip():
                            continue
                        item = json.loads(line)
                        if isinstance(item, dict):
                            return any(key in item for key in ["candidate_id", "name", "skills", "profile"])
            except Exception:
                return False

        if path.suffix.lower() == ".csv":
            try:
                with open(path, "r", encoding="utf-8", newline="") as handle:
                    header = handle.readline().strip().lower()
                return any(token in header for token in ["candidate", "skill", "name", "project"])
            except Exception:
                return False

        return False

    @staticmethod
    def _build_manifest(candidates: List[Dict[str, Any]], validation_report: ValidationReport, dataset_path: Optional[Path], output_dir: Path, session_id: Optional[str] = None) -> Dict[str, Any]:
        dataset_name = dataset_path.stem if dataset_path else "unknown_dataset"
        dataset_bytes = dataset_path.read_bytes() if dataset_path and dataset_path.exists() else b""
        dataset_hash = hashlib.sha256(dataset_bytes).hexdigest() if dataset_bytes else ""
        valid_candidates = len(candidates) - len(validation_report.failures) if validation_report.failures else len(candidates)
        invalid_candidates = max(0, len(candidates) - valid_candidates)
        manifest = {
            "dataset_name": dataset_name,
            "dataset_hash": dataset_hash,
            "candidate_count": len(candidates),
            "valid_candidates": valid_candidates,
            "invalid_candidates": invalid_candidates,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "schema_version": "1.0",
            "parser_version": "1.0",
        }
        if session_id:
            manifest["session_id"] = session_id
        return manifest

    @staticmethod
    def _build_parser_report(processed_candidates: List[Any], behavior_profiles: List[Any], validation_report: ValidationReport) -> Dict[str, Any]:
        if not processed_candidates:
            return {
                "validation_errors": [],
                "missing_fields": [],
                "duplicate_ids": [],
                "average_skills": 0,
                "average_experience": 0,
                "average_projects": 0,
                "profile_completeness_distribution": {},
                "behavior_score_distribution": {},
            }

        average_skills = round(sum(len(candidate.skills or []) for candidate in processed_candidates) / len(processed_candidates), 2)
        average_experience = round(sum(getattr(candidate, "experience_years", 0) or 0 for candidate in processed_candidates) / len(processed_candidates), 2)
        average_projects = round(sum(len(candidate.projects or []) for candidate in processed_candidates) / len(processed_candidates), 2)
        completeness_scores = [int(getattr(profile, "profile_completeness_score", 0) or 0) for profile in behavior_profiles]
        behavior_scores = [int(getattr(profile, "behavior_score", 0) or 0) for profile in behavior_profiles]

        return {
            "validation_errors": [failure.message for failure in validation_report.failures] + [warning.message for warning in validation_report.warnings],
            "missing_fields": list(validation_report.missing_fields or []),
            "duplicate_ids": list(validation_report.duplicate_ids or []),
            "average_skills": average_skills,
            "average_experience": average_experience,
            "average_projects": average_projects,
            "profile_completeness_distribution": ParserMetadataEngine._build_distribution(completeness_scores, [0, 25, 50, 75, 100]),
            "behavior_score_distribution": ParserMetadataEngine._build_distribution(behavior_scores, [0, 25, 50, 75, 100]),
        }

    @staticmethod
    def _build_skill_taxonomy() -> List[Dict[str, Any]]:
        return [
            {
                "canonical_name": skill.canonical_name,
                "aliases": list(skill.aliases),
                "category": skill.category,
            }
            for skill in taxonomy.skills
        ]

    @staticmethod
    def _build_role_taxonomy(job_intelligence: Optional[Dict[str, Any]], processed_candidates: List[Any]) -> List[Dict[str, Any]]:
        if job_intelligence:
            role = job_intelligence.get("role", {}) or {}
            return [
                {
                    "role_category": role.get("category") or role.get("title") or "Software Engineer",
                    "required_skills": job_intelligence.get("required_skills", []),
                    "preferred_skills": job_intelligence.get("preferred_skills", []),
                    "related_roles": [ParserMetadataEngine._infer_role_category(candidate.skills or []) for candidate in processed_candidates if getattr(candidate, "skills", None)]
                }
            ]

        return [
            {
                "role_category": ParserMetadataEngine._infer_role_category(candidate.skills or []),
                "required_skills": [],
                "preferred_skills": [],
                "related_roles": [],
            }
            for candidate in processed_candidates[:3]
        ]

    @staticmethod
    def _build_dataset_statistics(processed_candidates: List[Any]) -> Dict[str, Any]:
        skill_frequency = Counter()
        industry_distribution = Counter()
        experience_distribution = Counter()
        role_distribution = Counter()

        for candidate in processed_candidates:
            for skill in candidate.skills or []:
                skill_frequency[skill] += 1
            for project in candidate.projects or []:
                domain = getattr(project, "business_domain", None) or "Unknown"
                industry_distribution[domain] += 1
            experience_bucket = ParserMetadataEngine._bucket_experience(getattr(candidate, "experience_years", 0) or 0)
            experience_distribution[experience_bucket] += 1
            role_distribution[ParserMetadataEngine._infer_role_category(candidate.skills or [])] += 1

        return {
            "candidate_count": len(processed_candidates),
            "skill_frequency": dict(skill_frequency.most_common(20)),
            "industry_distribution": dict(industry_distribution),
            "experience_distribution": dict(experience_distribution),
            "role_distribution": dict(role_distribution),
        }

    @staticmethod
    def _build_distribution(values: List[int], buckets: List[int]) -> Dict[str, int]:
        distribution: Dict[str, int] = {}
        for idx in range(len(buckets) - 1):
            lower = buckets[idx]
            upper = buckets[idx + 1]
            label = f"{lower}-{upper - 1}"
            distribution[label] = 0

        for value in values:
            for idx in range(len(buckets) - 1):
                lower = buckets[idx]
                upper = buckets[idx + 1]
                if lower <= value <= upper:
                    label = f"{lower}-{upper - 1}"
                    distribution[label] += 1
                    break
            else:
                distribution[">100"] = distribution.get(">100", 0) + 1

        return {key: value for key, value in distribution.items() if value > 0}

    @staticmethod
    def _bucket_experience(years: float) -> str:
        if years < 2:
            return "0-2"
        if years < 5:
            return "2-5"
        if years < 8:
            return "5-8"
        return "8+"

    @staticmethod
    def _infer_role_category(skills: List[str]) -> str:
        normalized = [skill.lower() for skill in (skills or [])]
        if any(token in normalized for token in ["pytorch", "tensorflow", "scikit", "machine learning", "ml", "numpy", "pandas"]):
            return "Machine Learning Engineer"
        if any(token in normalized for token in ["react", "vue", "angular", "javascript", "typescript"]):
            return "Frontend Engineer"
        if any(token in normalized for token in ["kubernetes", "docker", "aws", "azure", "gcp", "terraform", "jenkins", "ci/cd"]):
            return "Platform Engineer"
        if any(token in normalized for token in ["python", "java", "go", "node.js", "node", "backend"]):
            return "Software Engineer"
        return "Generalist"

    @staticmethod
    def _write_json(path: Path, payload: Any) -> None:
        with open(path, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2)


__all__ = ["ParserMetadataEngine"]
