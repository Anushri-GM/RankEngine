import json
from typing import List, Dict, Any

class Loader:
    @staticmethod
    def load_json_bytes(json_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Parses raw JSON bytes stream into list of candidate dictionaries.
        """
        try:
            data = json.loads(json_bytes.decode("utf-8"))
            if isinstance(data, dict):
                # If wrapped inside key "candidates", extract it
                if "candidates" in data:
                    return data["candidates"]
                return [data]
            return data
        except Exception as e:
            raise ValueError(f"Failed to parse JSON: {str(e)}")

    @staticmethod
    def get_sample_candidates() -> List[Dict[str, Any]]:
        """
        Returns a high-fidelity sample candidate dataset for default runs or out-of-the-box UI demonstration.
        """
        return [
            {
                "candidate_id": "cand-01",
                "name": "Sarah Jenkins",
                "skills": ["React", "node", "javascript", "amazon web services", "Postgres"],
                "work_history": [
                    {
                        "company": "Tech Corp",
                        "role": "Software Developer",
                        "start_date": "2021-01",
                        "end_date": "2023-05",
                        "description": "Built standard application features using React and Node.js."
                    },
                    {
                        "company": "Innovate LLC",
                        "role": "Senior Full Stack Engineer",
                        "start_date": "2023-06",
                        "end_date": "Present",
                        "description": "Leading team developers. Upgrading platform architecture to AWS microservices."
                    }
                ],
                "projects": [
                    {
                        "name": "SaaS Platform Migration",
                        "description": "Migrated legacy monolith backend to node/react on AWS cloud for a fintech banking application.",
                        "technologies": ["React", "Node", "AWS"],
                        "role": "Senior Architect",
                        "duration_months": 12
                    }
                ],
                "education": [
                    {
                        "degree": "B.S.",
                        "major": "Computer Science",
                        "institution": "State University",
                        "year": 2020
                    }
                ],
                "certifications": [
                    {
                        "certification": "AWS Certified Solutions Architect",
                        "provider": "",
                        "year": 2022,
                        "category": "Cloud"
                    }
                ],
                "languages": ["English", "Spanish"],
                "activity_metadata": {
                    "github_contributions": 142,
                    "platform_logins": 12
                }
            },
            {
                "candidate_id": "cand-02",
                "name": "David Kojo",
                "skills": ["Python", "PyTorch", "Kubernetes", "Docker", "gcp"],
                "work_history": [
                    {
                        "company": "DeepMind Co",
                        "role": "ML Engineer",
                        "start_date": "2019-06",
                        "end_date": "Present",
                        "description": "Designing ML pipelines and scaling models on Kubernetes cluster."
                    }
                ],
                "projects": [
                    {
                        "name": "Recommendation Engine",
                        "description": "Trained custom collaborative filter models in PyTorch.",
                        "technologies": ["PyTorch", "Python", "Kubernetes"],
                        "role": "ML Engineer",
                        "duration_months": 24
                    }
                ],
                "education": [
                    {
                        "degree": "Masters",
                        "major": "Data Science",
                        "institution": "Tech Institute",
                        "year": 2019
                    }
                ],
                "certifications": [],
                "languages": ["English", "Twi"],
                "activity_metadata": {
                    "github_contributions": 48
                }
            }
        ]

    @staticmethod
    def get_candidate_schema() -> Dict[str, Any]:
        """
        Returns JSON schema representation of candidates for UI downloads or reference check.
        """
        return {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "CandidateDataset",
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "candidate_id": {"type": "string"},
                    "name": {"type": "string"},
                    "skills": {"type": "array", "items": {"type": "string"}},
                    "work_history": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "company": {"type": "string"},
                                "role": {"type": "string"},
                                "start_date": {"type": "string"},
                                "end_date": {"type": "string"},
                                "description": {"type": "string"}
                            },
                            "required": ["company", "role", "start_date"]
                        }
                    },
                    "projects": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "description": {"type": "string"},
                                "technologies": {"type": "array", "items": {"type": "string"}},
                                "role": {"type": "string"},
                                "duration_months": {"type": "integer"}
                            },
                            "required": ["name", "technologies"]
                        }
                    },
                    "education": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "degree": {"type": "string"},
                                "major": {"type": "string"},
                                "institution": {"type": "string"},
                                "year": {"type": "integer"}
                            }
                        }
                    },
                    "certifications": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "certification": {"type": "string"},
                                "provider": {"type": "string"},
                                "year": {"type": "integer"}
                            }
                        }
                    },
                    "languages": {"type": "array", "items": {"type": "string"}},
                    "activity_metadata": {"type": "object"}
                },
                "required": ["candidate_id", "name"]
            }
        }
