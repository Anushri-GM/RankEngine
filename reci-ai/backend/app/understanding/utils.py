import re
from datetime import datetime
from typing import Optional

def clean_text(text: str) -> str:
    """
    Remove excess whitespace and standard clean text.
    """
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def parse_date(date_str: str) -> Optional[datetime]:
    """
    Try parsing dates in various formats into datetime objects.
    """
    if not date_str:
        return None
    date_str = date_str.strip().lower()
    
    if date_str in ["present", "current", "now", "ongoing"]:
        return datetime.now()
        
    # Standard format cleanings
    formats = [
        "%Y-%m-%d", "%Y-%m", "%m/%Y", "%Y/%m", "%b %Y", "%B %Y", "%d/%m/%Y", "%Y"
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
            
    # Try matches for "MM-YYYY"
    match = re.match(r'(\d{1,2})[-/](\d{4})', date_str)
    if match:
        try:
            month = int(match.group(1))
            year = int(match.group(2))
            if 1 <= month <= 12:
                return datetime(year, month, 1)
        except Exception:
            pass
            
    # Try matches for "YYYY"
    match_yr = re.match(r'^(\d{4})$', date_str)
    if match_yr:
        try:
            year = int(match_yr.group(1))
            return datetime(year, 1, 1)
        except Exception:
            pass
            
    return None

def compute_months(start_str: str, end_str: Optional[str]) -> int:
    """
    Calculate the duration between two date strings in months.
    """
    start_dt = parse_date(start_str)
    if not start_dt:
        return 0
        
    end_dt = parse_date(end_str) if end_str else datetime.now()
    if not end_dt:
        end_dt = datetime.now()
        
    diff = (end_dt.year - start_dt.year) * 12 + (end_dt.month - start_dt.month)
    return max(0, diff)
