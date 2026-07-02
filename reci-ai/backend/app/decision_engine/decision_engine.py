import os
import json
from typing import List, Dict, Any
from pathlib import Path

from app.core.config import settings
from app.understanding.parser_metadata import ParserMetadataEngine
from app.decision_engine.embedding_engine import EmbeddingEngine
from app.decision_engine.faiss_index import FaissIndex
from app.decision_engine.cross_encoder_ranker import CrossEncoderRanker
from app.decision_engine.skill_match import SkillMatchEngine
from app.decision_engine.career_match import CareerMatchEngine


class DecisionEngine:
    def __init__(self):
        self.outputs = Path(settings.OUTPUT_PATH)
        self.cache = Path(settings.MODEL_CACHE)
        self._embedding = None
        self.index = FaissIndex()
        self._reranker = None

    @property
    def embedding(self) -> EmbeddingEngine:
        if self._embedding is None:
            self._embedding = EmbeddingEngine()
        return self._embedding

    @property
    def reranker(self) -> CrossEncoderRanker:
        if self._reranker is None:
            self._reranker = CrossEncoderRanker()
        return self._reranker

    def pre_run_validate_outputs(self) -> None:
        required = [
            "job_intelligence.json",
            "candidate_intelligence.json",
            "behavior_profiles.json",
            "manifest.json",
            "parser_report.json",
            "dataset_statistics.json",
            "skill_taxonomy.json",
            "role_taxonomy.json",
        ]
        missing = []
        for name in required:
            if not (self.outputs / name).exists():
                missing.append(name)

        if missing:
            dataset_path, _ = ParserMetadataEngine.discover_candidate_dataset(base_dir=self.outputs.parent)
            dataset_path_obj = Path(dataset_path) if dataset_path else None
            if dataset_path_obj and dataset_path_obj.exists():
                raw = ParserMetadataEngine.load_candidates_from_path(dataset_path_obj)
                if raw:
                    from app.understanding.candidate_understanding import CandidateUnderstandingEngine
                    from app.understanding.behavior_understanding import BehaviorUnderstanding
                    from app.understanding.validation_engine import ValidationEngine

                    validation_report = ValidationEngine.validate_candidate_dataset(raw)
                    processed = [CandidateUnderstandingEngine.process_candidate(c) for c in raw]
                    behaviors = [BehaviorUnderstanding.generate_profile(p, validation_report.status) for p in processed]
                    ParserMetadataEngine.generate_artifacts(raw, processed, behaviors, validation_report, dataset_path_obj, self.outputs)

                    enhanced_candidates = []
                    for idx, (candidate, profile) in enumerate(zip(processed, behaviors)):
                        enhanced_candidates.append(
                            ParserMetadataEngine.enrich_candidate_payload(
                                candidate=candidate,
                                behavior_profile=profile,
                                validation_status=validation_report.status,
                                profile_completeness=profile.profile_completeness_score,
                                index=idx,
                            )
                        )

                    with open(self.outputs / "candidate_intelligence.json", "w", encoding="utf-8") as handle:
                        json.dump(enhanced_candidates, handle, indent=2)

                    with open(self.outputs / "behavior_profiles.json", "w", encoding="utf-8") as handle:
                        json.dump([profile.model_dump() for profile in behaviors], handle, indent=2)

    def prepare_embeddings_and_index(self) -> None:
        # Load candidate intelligence
        cand_path = self.outputs / "candidate_intelligence.json"
        if not cand_path.exists():
            return
        with open(cand_path, "r", encoding="utf-8") as f:
            candidates = json.load(f)

        texts = []
        ids = []
        for c in candidates:
            cid = c.get("candidate_id")
            # combine skills, projects, experience, behavior into embedding text
            text_parts = []
            text_parts += c.get("skills", []) or []
            for p in c.get("projects", []):
                if isinstance(p, dict):
                    text_parts.append(p.get("name", ""))
                    text_parts.append(p.get("description", ""))
            text_parts.append(str(c.get("experience", {}).get("years", "")))
            text_parts.append(json.dumps(c.get("behavior_profile", {})))
            txt = " ".join([t for t in text_parts if t])
            texts.append(txt)
            ids.append(cid)

        vectors = self.embedding.embed_texts(texts, namespace="candidates")
        # build or load index based on manifest hash check
        manifest_path = self.outputs / "manifest.json"
        cache_hash_file = self.cache / "dataset_hash.txt"
        dataset_hash = None
        if manifest_path.exists():
            with open(manifest_path, "r", encoding="utf-8") as f:
                manifest = json.load(f)
            dataset_hash = manifest.get("dataset_hash", "")

        # If cache hash matches manifest, attempt to load index
        if dataset_hash and cache_hash_file.exists():
            try:
                with open(cache_hash_file, "r", encoding="utf-8") as f:
                    cached_hash = f.read().strip()
                if cached_hash == dataset_hash and self.index.load():
                    return
            except Exception:
                pass

        # build new index and persist dataset_hash
        self.index.build(vectors.astype('float32'), ids)
        try:
            if dataset_hash:
                with open(cache_hash_file, "w", encoding="utf-8") as f:
                    f.write(dataset_hash)
        except Exception:
            pass

    def retrieve_top_candidates(self, job_text: str, top_k: int = 50) -> List[Dict[str, Any]]:
        # embed job_text
        qvec = self.embedding.embed_texts([job_text], namespace="job")[0]
        results = self.index.search(qvec, top_k)
        return [{"candidate_id": cid, "score": score} for cid, score in results]

    def rerank_with_cross_encoder(self, job_text: str, candidate_texts: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        # candidate_texts: list of {candidate_id, text}
        pairs = [(c["candidate_id"], c["text"]) for c in candidate_texts]
        ranked = self.reranker.rerank(job_text, pairs)
        return [{"candidate_id": cid, "score": score} for cid, score in ranked]

    def score_candidates(self, ranked_candidates: List[Dict[str, Any]], job_intel: Dict[str, Any]) -> List[Dict[str, Any]]:
        # Attach skill & career match scores
        # Load processed candidates
        cand_path = self.outputs / "candidate_intelligence.json"
        with open(cand_path, "r", encoding="utf-8") as f:
            processed = {c.get("candidate_id"): c for c in json.load(f)}

        scored = []
        required = job_intel.get("required_skills", [])
        preferred = job_intel.get("preferred_skills", [])

        for item in ranked_candidates:
            cid = item.get("candidate_id")
            cand = processed.get(cid, {})
            cand_skills = cand.get("skills", [])
            sm = SkillMatchEngine.match(required, preferred, cand_skills)
            cm = CareerMatchEngine.score(type("X", (), cand), job_intel)
            combined = {
                "candidate_id": cid,
                "rank_score": item.get("score"),
                "skill_match": sm,
                "career_match": cm,
            }
            scored.append(combined)

        scored.sort(key=lambda x: x.get("rank_score", 0), reverse=True)
        return scored


__all__ = ["DecisionEngine"]
