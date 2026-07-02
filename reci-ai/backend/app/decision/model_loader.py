import os
from pathlib import Path
from typing import Optional

from app.core.config import settings


class DecisionModelLoader:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init()
        return cls._instance

    def _init(self) -> None:
        self.cache_dir = Path(settings.MODEL_CACHE)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self._embedding = None
        self._cross_encoder = None
        self._spacy = None

    def get_spacy(self) -> Optional[object]:
        if self._spacy is not None:
            return self._spacy

        try:
            import spacy
            try:
                self._spacy = spacy.load("en_core_web_lg")
            except Exception:
                spacy.cli.download("en_core_web_lg")
                self._spacy = spacy.load("en_core_web_lg")
        except Exception:
            self._spacy = None

        return self._spacy

    def get_embedding_model(self) -> Optional[object]:
        if self._embedding is not None:
            return self._embedding

        try:
            from sentence_transformers import SentenceTransformer
            self._embedding = SentenceTransformer("BAAI/bge-small-en-v1.5")
        except Exception:
            try:
                from sentence_transformers import SentenceTransformer
                self._embedding = SentenceTransformer("all-MiniLM-L6-v2")
            except Exception:
                self._embedding = None

        return self._embedding

    def get_cross_encoder(self) -> Optional[object]:
        if self._cross_encoder is not None:
            return self._cross_encoder

        try:
            from sentence_transformers import CrossEncoder
            self._cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
        except Exception:
            self._cross_encoder = None

        return self._cross_encoder
