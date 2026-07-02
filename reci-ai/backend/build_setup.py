#!/usr/bin/env python3
"""
build_setup.py — run as part of Render build to copy dataset into reci-ai/data/
so it's available at a stable relative path regardless of deployment structure.
"""

import json
import os
import shutil
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent  # reci-ai/backend/
RECI_AI_DIR = SCRIPT_DIR.parent     # reci-ai/
REPO_ROOT = RECI_AI_DIR.parent      # repo root (RankEngine/)

DATA_DIR = RECI_AI_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

TARGET_CANDIDATES = DATA_DIR / "sample_candidates.json"
TARGET_JOB = DATA_DIR / "job_description.docx"

# Search for sample_candidates.json
SEARCH_PATHS = [
    REPO_ROOT / "Dataset" / "[PUB] India_runs_data_and_ai_challenge" / "India_runs_data_and_ai_challenge" / "sample_candidates.json",
    REPO_ROOT / "Dataset" / "India_runs_data_and_ai_challenge" / "India_runs_data_and_ai_challenge" / "sample_candidates.json",
    REPO_ROOT / "Dataset" / "sample_candidates.json",
    REPO_ROOT / "extracted_data" / "sample_candidates.json",
]

SEARCH_PATHS_JOB = [
    REPO_ROOT / "Dataset" / "[PUB] India_runs_data_and_ai_challenge" / "India_runs_data_and_ai_challenge" / "job_description.docx",
    REPO_ROOT / "Dataset" / "India_runs_data_and_ai_challenge" / "India_runs_data_and_ai_challenge" / "job_description.docx",
    REPO_ROOT / "Dataset" / "job_description.docx",
]


def copy_file(search_paths, target):
    for src in search_paths:
        if src.exists():
            shutil.copy2(src, target)
            print(f"✅ Copied {src.name} → {target}")
            return True
    print(f"⚠️  Could not find source for {target.name}")
    return False


if not TARGET_CANDIDATES.exists():
    copy_file(SEARCH_PATHS, TARGET_CANDIDATES)
else:
    print(f"✅ {TARGET_CANDIDATES.name} already present")

if not TARGET_JOB.exists():
    copy_file(SEARCH_PATHS_JOB, TARGET_JOB)
else:
    print(f"✅ {TARGET_JOB.name} already present")

print("Build setup complete.")
