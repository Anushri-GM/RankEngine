import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCandidates } from '../../hooks/api/candidates';
import { useSession } from '../../hooks/api/sessions';
import { Button, EmptyState, SkeletonLoader } from '../../components/common';
import { CandidateCard } from '../../components/cards/CandidateCard';
import type { SearchFilters } from '../../types';
import { Search, Download, GitCompare, SlidersHorizontal } from 'lucide-react';

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const CARD_ITEM = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
};

export const WorkspacePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data: session } = useSession(sessionId);
  const { data: candidates, isLoading } = useCandidates(sessionId);

  const [selectedCandidates, setSelectedCandidates] = React.useState<string[]>([]);
  const [filters, setFilters] = React.useState<SearchFilters>({ sort_by: 'fit_score', sort_order: 'desc' });
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredCandidates = React.useMemo(() => {
    if (!candidates) return [];
    return candidates
      .filter((c) => {
        if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (filters.fit_score_min && c.overall_fit_score < filters.fit_score_min) return false;
        if (filters.fit_score_max && c.overall_fit_score > filters.fit_score_max) return false;
        return true;
      })
      .sort((a, b) => {
        const key = filters.sort_by || 'fit_score';
        const vals: Record<string, [number, number]> = {
          fit_score:    [a.overall_fit_score,       b.overall_fit_score],
          trust_score:  [a.recruiter_trust_score,   b.recruiter_trust_score],
          technical_fit:[a.technical_fit,            b.technical_fit],
          career_fit:   [a.career_fit,               b.career_fit],
        };
        const [aV, bV] = vals[key] ?? [0, 0];
        return filters.sort_order === 'desc' ? bV - aV : aV - bV;
      });
  }, [candidates, searchTerm, filters]);

  const handleToggleSelect = (id: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (selectedCandidates.length === 2) {
      navigate(`/compare/${sessionId}/${selectedCandidates[0]}/${selectedCandidates[1]}`);
    }
  };

  if (!sessionId) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ letterSpacing: '-0.025em' }}>
            {session?.role_title || 'Candidate Workspace'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {candidates?.length ?? 0} candidates ranked by AI
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/insights/${sessionId}`)}
          >
            <Download size={14} />
            Export
          </Button>
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search candidates by name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="reci-input pl-9"
          />
        </div>

        {/* Sort */}
        <div className="flex gap-2 items-center">
          <SlidersHorizontal size={14} className="text-slate-400 flex-shrink-0" />
          <select
            value={filters.sort_by || 'fit_score'}
            onChange={(e) => setFilters({ ...filters, sort_by: e.target.value as any })}
            className="reci-input w-auto pr-8"
            style={{ paddingRight: '2rem' }}
          >
            <option value="fit_score">Overall Fit</option>
            <option value="trust_score">Trust Score</option>
            <option value="technical_fit">Technical Fit</option>
            <option value="career_fit">Career Fit</option>
          </select>
          <select
            value={filters.sort_order || 'desc'}
            onChange={(e) => setFilters({ ...filters, sort_order: e.target.value as any })}
            className="reci-input w-auto pr-8"
            style={{ paddingRight: '2rem' }}
          >
            <option value="desc">Highest First</option>
            <option value="asc">Lowest First</option>
          </select>
        </div>
      </div>

      {/* ── Compare Bar ──────────────────────────────────────── */}
      {selectedCandidates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <GitCompare size={16} className="text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-800">
              {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? 's' : ''} selected
            </span>
            {selectedCandidates.length < 2 && (
              <span className="text-xs text-indigo-500">Select one more to compare</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedCandidates([])}>
              Clear
            </Button>
            <Button
              size="sm"
              disabled={selectedCandidates.length !== 2}
              onClick={handleCompare}
            >
              Compare ({selectedCandidates.length}/2)
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── Candidates Grid ───────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-72" />
          ))}
        </div>
      ) : !filteredCandidates || filteredCandidates.length === 0 ? (
        <div className="reci-card p-12">
          <EmptyState
            icon="🔍"
            title={searchTerm ? 'No candidates found' : 'No candidates yet'}
            description={
              searchTerm
                ? `No candidates match "${searchTerm}". Try adjusting your search.`
                : 'Run the ranking pipeline to analyze candidates.'
            }
          />
        </div>
      ) : (
        <motion.div
          variants={STAGGER}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredCandidates.map((candidate) => (
            <motion.div
              key={candidate.candidate_id}
              variants={CARD_ITEM}
              onClick={() => handleToggleSelect(candidate.candidate_id)}
            >
              <CandidateCard
                candidate={candidate}
                isSelected={selectedCandidates.includes(candidate.candidate_id)}
                onViewDetails={() => navigate(`/candidate/${sessionId}/${candidate.candidate_id}`)}
                onCompare={() => {
                  if (selectedCandidates.length < 2 || selectedCandidates.includes(candidate.candidate_id)) {
                    handleToggleSelect(candidate.candidate_id);
                  }
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default WorkspacePage;
