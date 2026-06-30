from typing import List, Tuple
from app.understanding.utils import clean_text

class RoleUnderstanding:
    @staticmethod
    def classify_role(title: str, skills: List[str]) -> Tuple[str, str]:
        """
        Classifies a job description title or candidate title into a standard Role Category and Seniority.
        Returns: (Role Category, Seniority)
        """
        title_clean = clean_text(title).lower()
        skills_lower = [s.lower() for s in skills]

        # 1. Determine Seniority
        seniority = "Mid"
        if any(w in title_clean for w in ["sr", "senior", "lead", "architect", "principal", "chief", "manager"]):
            seniority = "Senior"
        elif any(w in title_clean for w in ["jr", "junior", "associate", "entry", "intern", "trainee"]):
            seniority = "Junior"

        # 2. Classify Category based on keywords
        if "data scientist" in title_clean or "data science" in title_clean:
            return "Data Scientist", seniority
        if any(w in title_clean for w in ["ml", "machine learning", "computer vision", "nlp", "ai engineer"]):
            return "ML Engineer", seniority
        if any(w in title_clean for w in ["devops", "sre", "site reliability", "infrastructure", "platform engineer"]):
            return "DevOps", seniority
        if any(w in title_clean for w in ["product manager", "technical product manager", "pm"]):
            return "Product Manager", seniority
        if any(w in title_clean for w in ["qa", "quality assurance", "test engineer", "automation engineer"]):
            return "QA", seniority
        if any(w in title_clean for w in ["business analyst", "data analyst", "system analyst"]):
            return "Business Analyst", seniority
        if any(w in title_clean for w in ["frontend", "front-end", "ui developer", "web developer"]):
            return "Frontend Engineer", seniority
        if any(w in title_clean for w in ["backend", "back-end", "server engineer"]):
            return "Backend Engineer", seniority
        if any(w in title_clean for w in ["fullstack", "full-stack", "full stack"]):
            return "Full Stack Engineer", seniority

        # 3. Fallback: Classify using skill profile indicators
        fe_skills = ["react", "angular", "vue", "javascript", "js", "typescript", "html", "css"]
        be_skills = ["python", "java", "go", "golang", "node", "nodejs", "node.js", "postgres", "postgresql", "mysql", "mongodb", "redis"]
        devops_skills = ["aws", "azure", "gcp", "docker", "kubernetes", "k8s", "terraform", "jenkins", "ci/cd", "ansible"]
        ds_skills = ["tensorflow", "pytorch", "scikit-learn", "sklearn", "pandas", "numpy", "ml", "machine learning"]

        fe_score = sum(1 for s in skills_lower if s in fe_skills)
        be_score = sum(1 for s in skills_lower if s in be_skills)
        devops_score = sum(1 for s in skills_lower if s in devops_skills)
        ds_score = sum(1 for s in skills_lower if s in ds_skills)

        scores = {
            "Frontend Engineer": fe_score,
            "Backend Engineer": be_score,
            "DevOps": devops_score,
            "Data Scientist": ds_score
        }

        max_cat = max(scores, key=scores.get)
        if scores[max_cat] > 0:
            return max_cat, seniority

        # If nothing matches, fallback based on engineer word presence
        if "engineer" in title_clean or "developer" in title_clean:
            return "Backend Engineer", seniority
            
        return "Backend Engineer", seniority
