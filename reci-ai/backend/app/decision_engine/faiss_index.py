import os
from pathlib import Path
from typing import Optional, Tuple, List
import numpy as np

try:
    import faiss
    _FAISS_AVAILABLE = True
except Exception:
    faiss = None
    _FAISS_AVAILABLE = False

from app.core.config import settings


class FaissIndex:
    def __init__(self):
        self.cache_dir = Path(settings.MODEL_CACHE)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.index_path = self.cache_dir / "faiss.index"
        self.index = None
        self.ids = []

    def build(self, vectors: np.ndarray, ids: List[str]) -> None:
        dim = vectors.shape[1]
        if _FAISS_AVAILABLE:
            index = faiss.IndexFlatIP(dim)
            faiss.normalize_L2(vectors)
            index.add(vectors)
            faiss.write_index(index, str(self.index_path))
            self.index = index
            self.ids = list(ids)
        else:
            # store arrays for fallback
            np.save(self.cache_dir / "faiss_vectors.npy", vectors)
            with open(self.cache_dir / "faiss_ids.json", "w", encoding="utf-8") as f:
                import json
                json.dump(ids, f)
            self.index = None
            self.ids = list(ids)

    def load(self) -> bool:
        if _FAISS_AVAILABLE and self.index_path.exists():
            try:
                self.index = faiss.read_index(str(self.index_path))
                return True
            except Exception:
                return False
        else:
            vec_path = self.cache_dir / "faiss_vectors.npy"
            ids_path = self.cache_dir / "faiss_ids.json"
            if vec_path.exists() and ids_path.exists():
                try:
                    self._vectors = np.load(vec_path)
                    import json
                    with open(ids_path, "r", encoding="utf-8") as f:
                        self.ids = json.load(f)
                    return True
                except Exception:
                    return False
        return False

    def search(self, query_vector, top_k: int = 50) -> List[Tuple[str, float]]:
        import numpy as np
        if _FAISS_AVAILABLE and self.index is not None:
            q = np.array(query_vector, dtype='float32').reshape(1, -1)
            faiss.normalize_L2(q)
            D, I = self.index.search(q, top_k)
            results = []
            for idx, score in zip(I[0], D[0]):
                if idx < 0 or idx >= len(self.ids):
                    continue
                results.append((self.ids[idx], float(score)))
            return results
        else:
            # brute force cosine
            vecs = getattr(self, "_vectors", None)
            if vecs is None:
                return []
            q = np.array(query_vector, dtype=float).reshape(1, -1)
            # normalize
            def _norm(a):
                n = np.linalg.norm(a, axis=1, keepdims=True)
                n[n==0]=1
                return a / n
            qn = _norm(q)
            vecsn = _norm(vecs)
            sims = (vecsn @ qn.T).squeeze()
            top_idx = sims.argsort()[::-1][:top_k]
            return [(self.ids[i], float(sims[i])) for i in top_idx]


__all__ = ["FaissIndex"]
