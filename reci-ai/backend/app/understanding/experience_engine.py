from typing import List, Dict, Any
from app.understanding.schema import CareerTimeline, CareerTimelineItem
from app.understanding.utils import compute_months, clean_text, parse_date

class ExperienceEngine:
    @staticmethod
    def analyze_timeline(work_history: List[Dict[str, Any]]) -> CareerTimeline:
        """
        Parses raw work history list and computes career stability, role progression, promotions and total experience months.
        """
        if not work_history:
            return CareerTimeline(
                items=[],
                total_months=0,
                promotion_trend="Neutral",
                role_progression=[],
                industry_experience=["Technology"],
                career_stability="No Work History"
            )

        # Sort work history chronologically (oldest first)
        def get_sort_key(item):
            dt = parse_date(item.get("start_date", ""))
            return dt.timestamp() if dt else 0

        sorted_history = sorted(work_history, key=get_sort_key)

        timeline_items = []
        total_months = 0
        role_progression = []
        company_roles = {}
        
        for job in sorted_history:
            company = clean_text(job.get("company", "Unknown Company"))
            role = clean_text(job.get("role", "Software Engineer"))
            start_date = job.get("start_date", "")
            end_date = job.get("end_date", None)
            description = job.get("description", "")
            
            dur = compute_months(start_date, end_date)
            total_months += dur
            role_progression.append(role)
            
            # Detect internal promotion:
            is_promotion = False
            if company in company_roles:
                prev_role = company_roles[company]
                # If current title is Senior/Lead and previous wasn't
                if any(w in role.lower() for w in ["sr", "senior", "lead", "manager", "director", "head"]) and not any(w in prev_role.lower() for w in ["sr", "senior", "lead", "manager", "director", "head"]):
                    is_promotion = True
            
            company_roles[company] = role
            
            timeline_items.append(CareerTimelineItem(
                company=company,
                role=role,
                start_date=start_date,
                end_date=end_date,
                duration_months=dur,
                description=description,
                is_promotion=is_promotion
            ))

        # Promotion Trend:
        has_internal_promo = any(item.is_promotion for item in timeline_items)
        has_title_upgrade = False
        if len(timeline_items) > 1:
            first_title = timeline_items[0].role.lower()
            last_title = timeline_items[-1].role.lower()
            if any(w in last_title for w in ["sr", "senior", "lead", "architect", "manager"]) and not any(w in first_title for w in ["sr", "senior", "lead", "architect", "manager"]):
                has_title_upgrade = True
                
        promotion_trend = "Positive" if (has_internal_promo or has_title_upgrade) else "Stable"

        # Career Stability based on tenure
        num_jobs = len(timeline_items)
        avg_tenure_months = total_months / num_jobs if num_jobs > 0 else 0
        
        if avg_tenure_months >= 36:
            career_stability = "High Stability"
        elif avg_tenure_months >= 20:
            career_stability = "Stable"
        elif avg_tenure_months >= 12:
            career_stability = "Moderate"
        else:
            career_stability = "Low Stability (Frequent Changes)"

        # Infer industries
        industries = set()
        for item in timeline_items:
            text_to_check = f"{item.company} {item.description}".lower()
            if any(w in text_to_check for w in ["bank", "fintech", "finance", "capital", "payment", "crypto", "trading"]):
                industries.add("Finance")
            if any(w in text_to_check for w in ["health", "medical", "clinic", "pharma", "biotech", "healthcare"]):
                industries.add("Healthcare")
            if any(w in text_to_check for w in ["shop", "retail", "commerce", "store", "logistic", "delivery", "shipping"]):
                industries.add("E-commerce")
            if any(w in text_to_check for w in ["software", "tech", "cloud", "saas", "digital", "compute", "networks"]):
                industries.add("Technology")
                
        if not industries:
            industries.add("Technology")

        return CareerTimeline(
            items=timeline_items,
            total_months=total_months,
            promotion_trend=promotion_trend,
            role_progression=role_progression,
            industry_experience=list(industries),
            career_stability=career_stability
        )
