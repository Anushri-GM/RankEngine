from typing import Dict, List, Optional
from app.understanding.schema import BehaviorProfile, CandidateIntelligence
from app.understanding.skill_taxonomy import taxonomy

class BehaviorUnderstanding:
    @staticmethod
    def generate_profile(candidate: CandidateIntelligence, validation_status: str) -> BehaviorProfile:
        """
        Calculates completeness, evaluates learning speed, tenure consistency, and assigns a behavior index score.
        """
        # 1. Profile Completeness Score (0-100) (Step 12)
        completeness = 0
        if candidate.skills: completeness += 20
        if candidate.projects: completeness += 20
        if candidate.career_timeline.items: completeness += 20
        if candidate.education: completeness += 15
        if candidate.certifications: completeness += 15
        if candidate.languages: completeness += 10
        
        # 2. Career Stability Tenure Indicators (Step 5 & 9)
        stability = candidate.career_timeline.career_stability
        stability_score = 70
        stability_summary = "Stable career trajectory."
        if stability == "High Stability":
            stability_summary = "Outstanding retention record with extended roles."
            stability_score = 95
        elif stability == "Stable":
            stability_summary = "Solid, consistent tenure duration across companies."
            stability_score = 85
        elif stability == "Moderate":
            stability_summary = "Moderate job movement; common transitional periods."
            stability_score = 65
        elif "Low Stability" in stability:
            stability_summary = "Frequent short-term job changes, showing potential retention flags."
            stability_score = 45

        # 3. Project Diversity
        domains = set(p.business_domain for p in candidate.projects if p.business_domain)
        if len(domains) >= 3:
            diversity = "High (Broad exposure across distinct fields)"
            div_score = 90
        elif len(domains) == 2:
            diversity = "Moderate (Work distributed in 2 key domains)"
            div_score = 75
        else:
            diversity = "Specialized (Deeply focused in a single industry domain)"
            div_score = 60

        # 4. Technology Adoption
        tech_set = set()
        for p in candidate.projects:
            tech_set.update(p.technologies)
            
        has_cutting_edge = any(
            t.lower() in ["aws", "gcp", "azure", "kubernetes", "docker", "pytorch", "tensorflow", "terraform", "ci/cd"]
            for t in tech_set
        )
        if has_cutting_edge:
            tech_adoption = "Rapid (Adopter of cloud-native infrastructure / ML systems)"
            tech_score = 92
        else:
            tech_adoption = "Standard (Maintains core platform technologies)"
            tech_score = 70

        # 5. Learning Velocity & Certs
        num_certs = len(candidate.certifications)
        if num_certs >= 3:
            cert_frequency = "High"
            learn_velocity = "High (Active certification frequency and regular updates)"
            learn_score = 95
        elif num_certs >= 1:
            cert_frequency = "Medium"
            learn_velocity = "Moderate (Continuous professional development and training)"
            learn_score = 80
        else:
            cert_frequency = "Low"
            learn_velocity = "Standard (Primarily project-driven skill progression)"
            learn_score = 65

        # 6. Recent Skill Growth
        recent_skill_growth = "Accelerated" if num_certs > 0 or len(tech_set) > 4 else "Steady"

        # 7. Activity & Engagement Score
        activity_meta = candidate.activity_metadata or {}
        contribs = activity_meta.get("github_contributions")
        logins = activity_meta.get("platform_logins")
        
        activity_score = None
        if contribs is not None or logins is not None:
            c_score = min(100.0, (contribs or 0) / 100 * 100) if contribs else 50
            l_score = min(100.0, (logins or 0) / 10 * 100) if logins else 50
            activity_score = (c_score + l_score) / 2
            engagement_score = activity_score
            contribution_consistency = "High (Active developer contributions)" if activity_score > 70 else "Consistent"
        else:
            # Derive Engagement Score from evidence
            derived_score = (completeness * 0.7) + (len(candidate.projects) * 5)
            engagement_score = min(100.0, derived_score)
            contribution_consistency = "Self-Driven (Identified via historical commits)"

        # 8. Composite Behavior Score (0-100)
        behavior_score = int(
            (completeness * 0.3) +
            (stability_score * 0.3) +
            (learn_score * 0.2) +
            (engagement_score * 0.2)
        )
        
        # Skill categories and domain expertise mapping
        skill_cats = {}
        for s in candidate.skills:
            cat = taxonomy.get_category(s)
            if cat not in skill_cats:
                skill_cats[cat] = []
            skill_cats[cat].append(s)

        domain_expertise = [cat for cat, s_list in skill_cats.items() if len(s_list) >= 2]
        if not domain_expertise:
            domain_expertise = ["Software Engineering"]

        behavior_summary = (
            f"{candidate.name} is a {candidate.career_timeline.career_stability.lower()} candidate "
            f"displaying {learn_velocity.lower()}. Overall profile completeness score is {completeness}% "
            f"with an active technology adoption rating."
        )

        return BehaviorProfile(
            candidate_id=candidate.candidate_id,
            profile_completeness_score=completeness,
            validation_status=validation_status,
            skill_categories=skill_cats,
            domain_expertise=domain_expertise,
            career_stability=stability,
            project_diversity=diversity,
            technology_adoption=tech_adoption,
            learning_velocity=learn_velocity,
            certification_frequency=cert_frequency,
            contribution_consistency=contribution_consistency,
            recent_skill_growth=recent_skill_growth,
            activity_score=activity_score,
            engagement_score=round(engagement_score, 1),
            behavior_score=behavior_score,
            behavior_summary=behavior_summary
        )
