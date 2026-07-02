import os
import json
from typing import List, Dict, Any, Optional
import numpy as np
from pathlib import Path
from app.decision_engine.model_loader import ModelLoader
from app.core.config import settings


class EmbeddingEngine:
    def __init__(self):
        self.loader = ModelLoader()
        self.model = self.loader.get_embedding_model()
        self.cache_dir = Path(settings.MODEL_CACHE)
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def embed_texts(self, texts: List[str], namespace: str = "default") -> np.ndarray:
        key = self._cache_key(namespace)
        cache_path = self.cache_dir / f"embeddings_{key}.npy"
        meta_path = self.cache_dir / f"embeddings_{key}.json"

        if cache_path.exists():
            try:
                arr = np.load(cache_path)
                return arr
            except Exception:
                pass

        if not self.model:
            # fallback: simple TF-IDF-ish using character hashing
            arr = np.array([[hash(t) % 1000 / 1000.0 for _ in range(128)] for t in texts], dtype=float)
        else:
            arr = self.model.encode(texts, show_progress_bar=False, convert_to_numpy=True)

        try:
            np.save(cache_path, arr)
            with open(meta_path, "w", encoding="utf-8") as f:
                json.dump({"count": len(texts)}, f)
        except Exception:
            pass

        return arr

    def _cache_key(self, namespace: str) -> str:
        return namespace.replace("/", "_")


__all__ = ["EmbeddingEngine"]
