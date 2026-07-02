from typing import List, Tuple
from app.decision_engine.model_loader import ModelLoader


class CrossEncoderRanker:
    def __init__(self):
        self.model = ModelLoader().get_cross_encoder()

    def rerank(self, query: str, candidates: List[Tuple[str, str]]) -> List[Tuple[str, float]]:
        """
        candidates: list of (candidate_id, text_to_score)
        returns list of (candidate_id, score) sorted descending
        """
        if not candidates:
            return []

        texts = [text for _, text in candidates]
        ids = [cid for cid, _ in candidates]

        if self.model is None:
            # fallback: score by length similarity
            scores = [float(min(len(query), len(t)) / max(1, abs(len(query)-len(t))+1)) for t in texts]
        else:
            scores = self.model.predict([(query, t) for t in texts])

        paired = list(zip(ids, [float(s) for s in scores]))
        paired.sort(key=lambda x: x[1], reverse=True)
        return paired


__all__ = ["CrossEncoderRanker"]
