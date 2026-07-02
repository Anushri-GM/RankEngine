import json
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np


class EmbeddingCache:
    def __init__(self, session_id: str, base_upload_dir: Optional[str] = None):
        root = Path(base_upload_dir) if base_upload_dir else Path(__file__).resolve().parents[3] / "uploads"
        self.cache_dir = root / session_id / "cache"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.meta_path = self.cache_dir / "cache_meta.json"

    def _embedding_path(self, namespace: str) -> Path:
        return self.cache_dir / f"embeddings_{namespace}.npy"

    def _ids_path(self, namespace: str) -> Path:
        return self.cache_dir / f"embeddings_{namespace}_ids.json"

    def has_embeddings(self, namespace: str) -> bool:
        return self._embedding_path(namespace).exists() and self._ids_path(namespace).exists()

    def is_valid(self, dataset_hash: str) -> bool:
        if not self.meta_path.exists():
            return False
        try:
            with open(self.meta_path, "r", encoding="utf-8") as handle:
                meta = json.load(handle)
            return meta.get("dataset_hash") == dataset_hash
        except Exception:
            return False

    def save_embeddings(self, namespace: str, vectors: Any, ids: Optional[List[str]] = None, dataset_hash: Optional[str] = None) -> None:
        np.save(self._embedding_path(namespace), vectors)
        if ids is not None:
            with open(self._ids_path(namespace), "w", encoding="utf-8") as handle:
                json.dump(ids, handle)
        if dataset_hash is not None:
            with open(self.meta_path, "w", encoding="utf-8") as handle:
                json.dump({"dataset_hash": dataset_hash}, handle)

    def load_embeddings(self, namespace: str) -> Optional[Dict[str, Any]]:
        embedding_path = self._embedding_path(namespace)
        ids_path = self._ids_path(namespace)
        if not embedding_path.exists() or not ids_path.exists():
            return None
        try:
            vectors = np.load(embedding_path)
            with open(ids_path, "r", encoding="utf-8") as handle:
                ids = json.load(handle)
            return {"vectors": vectors, "ids": ids}
        except Exception:
            return None

    def clear(self) -> None:
        for child in self.cache_dir.glob("*"):
            try:
                child.unlink()
            except Exception:
                continue
