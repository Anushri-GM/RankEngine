import os
from typing import Optional
from app.core.config import settings

class ModelLoader:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init()
        return cls._instance

    def _init(self):
        self.cache_dir = settings.MODEL_CACHE
        os.makedirs(self.cache_dir, exist_ok=True)
        self._spacy = None
        self._embedding = None
        self._cross_encoder = None

    def get_spacy(self):
        if self._spacy is None:
            try:
                import spacy
                try:
                    self._spacy = spacy.load("en_core_web_sm")
                except Exception:
                    spacy.cli.download("en_core_web_sm")
                    self._spacy = spacy.load("en_core_web_sm")
            except Exception:
                self._spacy = None
        return self._spacy

    def get_embedding_model(self):
        if settings.LIGHTWEIGHT_MODE:
            return None
        if self._embedding is None:
            try:
                from sentence_transformers import SentenceTransformer
                try:
                    self._embedding = SentenceTransformer("BAAI/bge-small-en-v1.5")
                except Exception:
                    self._embedding = SentenceTransformer("all-MiniLM-L6-v2")
            except Exception:
                self._embedding = None
        return self._embedding

    def get_cross_encoder(self):
        if settings.LIGHTWEIGHT_MODE:
            return None
        if self._cross_encoder is None:
            try:
                from sentence_transformers import CrossEncoder
                self._cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
            except Exception:
                self._cross_encoder = None
        return self._cross_encoder


__all__ = ["ModelLoader"]
