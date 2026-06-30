from typing import List, Dict, Any
from app.understanding.schema import CandidateCertification
from app.understanding.utils import clean_text

class CertificationEngine:
    @staticmethod
    def parse_certifications(certs_list: List[Dict[str, Any]]) -> List[CandidateCertification]:
        """
        Parses raw certifications list, resolves missing providers, and flags categories.
        """
        if not certs_list:
            return []

        parsed = []
        for cert in certs_list:
            name = clean_text(cert.get("certification", "Certification"))
            provider_raw = clean_text(cert.get("provider", ""))
            
            try:
                year = int(cert.get("year", 2020))
            except Exception:
                year = 2020

            # Map Provider
            provider = provider_raw
            name_lower = name.lower()
            if not provider:
                if "aws" in name_lower or "amazon" in name_lower:
                    provider = "AWS"
                elif "azure" in name_lower or "microsoft" in name_lower:
                    provider = "Microsoft"
                elif "google" in name_lower or "gcp" in name_lower:
                    provider = "Google"
                elif "oracle" in name_lower or "java" in name_lower:
                    provider = "Oracle"
                elif "scrum" in name_lower or "csm" in name_lower:
                    provider = "Scrum Alliance"
                else:
                    provider = "Various"

            # Category mapping
            category = "General"
            if any(w in name_lower for w in ["aws", "azure", "gcp", "cloud"]):
                category = "Cloud"
            elif any(w in name_lower for w in ["scrum", "agile", "pmp", "product", "csm"]):
                category = "Agile / Management"
            elif any(w in name_lower for w in ["kubernetes", "docker", "devops", "terraform", "helm", "jenkins"]):
                category = "DevOps"
            elif any(w in name_lower for w in ["security", "cissp", "ceh", "cyber"]):
                category = "Security"
            elif any(w in name_lower for w in ["python", "java", "react", "developer", "node"]):
                category = "Software Engineering"

            parsed.append(CandidateCertification(
                certification=name,
                provider=provider,
                year=year,
                category=category
            ))
        return parsed
