from typing import Dict, List, Optional

class Skill:
    def __init__(self, canonical_name: str, category: str, aliases: List[str]):
        self.canonical_name = canonical_name
        self.category = category
        # Include canonical name in lowercase in aliases list
        self.aliases = [a.lower() for a in aliases] + [canonical_name.lower()]

class SkillTaxonomy:
    def __init__(self):
        self.skills: List[Skill] = [
            # Backend
            Skill("Python", "Backend", ["py", "python3", "python 3"]),
            Skill("Java", "Backend", ["java se", "jdk", "j2ee"]),
            Skill("Go", "Backend", ["golang", "go-lang"]),
            Skill("Node.js", "Backend", ["node", "nodejs"]),
            
            # Cloud
            Skill("AWS", "Cloud", ["amazon web services", "ec2", "s3", "rds", "lambda", "fargate", "ecs"]),
            Skill("Azure", "Cloud", ["microsoft azure", "azure devops"]),
            Skill("GCP", "Cloud", ["google cloud", "google cloud platform", "gke"]),
            
            # Containers
            Skill("Docker", "Containers", ["docker container", "dockerize", "dockerfiles"]),
            Skill("Kubernetes", "Containers", ["k8s", "k8s cluster", "helm"]),
            
            # Database
            Skill("MongoDB", "Database", ["mongo", "documentdb"]),
            Skill("Redis", "Database", ["redis cache"]),
            Skill("PostgreSQL", "Database", ["postgres", "postgresql db"]),
            Skill("MySQL", "Database", ["mysql db"]),
            
            # Data Science
            Skill("TensorFlow", "Data Science", ["tensorflow", "tf"]),
            Skill("PyTorch", "Data Science", ["pytorch", "torch"]),
            Skill("Scikit-learn", "Data Science", ["scikit learn", "sklearn"]),
            Skill("Pandas", "Data Science", ["pandas dataframes"]),
            Skill("NumPy", "Data Science", ["numpy arrays"]),
            
            # Frontend
            Skill("React", "Frontend", ["reactjs", "react.js", "react native"]),
            Skill("Angular", "Frontend", ["angularjs", "angular.js"]),
            Skill("Vue", "Frontend", ["vuejs", "vue.js"]),
            
            # DevOps
            Skill("Terraform", "DevOps", ["tf config", "iac"]),
            Skill("Jenkins", "DevOps", ["jenkins ci"]),
            Skill("CI/CD", "DevOps", ["continuous integration", "continuous delivery", "github actions", "gitlab ci"]),
            
            # Networking & Core
            Skill("Linux", "Networking", ["ubuntu", "debian", "alpine", "centos", "redhat", "unix"]),
            Skill("REST APIs", "Networking", ["rest api", "restful", "restful api", "web api"]),
            Skill("Git", "Networking", ["github", "gitlab", "version control"]),
            
            # Aliases for Normalization mapping (Step 7)
            Skill("JavaScript", "Frontend", ["js", "javascript"]),
            Skill("Machine Learning", "Data Science", ["ml", "machinelearning"])
        ]
        
        # Build mapping for lookup
        self.lookup: Dict[str, Skill] = {}
        for s in self.skills:
            for alias in s.aliases:
                self.lookup[alias] = s
                
    def get_canonical(self, skill_name: str) -> Optional[str]:
        """
        Resolve a skill to its canonical name if it exists in the taxonomy.
        """
        skill_name_lower = skill_name.strip().lower()
        if skill_name_lower in self.lookup:
            return self.lookup[skill_name_lower].canonical_name
        return None

    def get_category(self, skill_name: str) -> Optional[str]:
        """
        Get the classification category for a skill.
        """
        skill_name_lower = skill_name.strip().lower()
        if skill_name_lower in self.lookup:
            return self.lookup[skill_name_lower].category
        return "Other"

taxonomy = SkillTaxonomy()
