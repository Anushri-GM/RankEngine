import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCandidates, useSearchCandidates } from '../../hooks/api/candidates';
import { useSession } from '../../hooks/api/sessions';
import { Card, Button, Spinner, EmptyState, SkeletonLoader } from '../../components/common';
import { CandidateCard } from '../../components/cards/CandidateCard';
import { SearchFilters, CandidateProfile } from '../../types';
import { Search, Filter, Download } from 'lucide-react';

export const WorkspacePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data: session } = useSession(sessionId);
  const { data: candidates, isLoading } = useCandidates(sessionId);
  const [selectedCandidates, setSelectedCandidates] = React.useState<string[]>([]);
  const [filters, setFilters] = React.useState<SearchFilters>({
    sort_by: 'fit_score',
    sort_order: 'desc',
  });
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredCandidates = React.useMemo(() => {
    if (!candidates) return [];
    return candidates
      .filter((c) => {
        if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        if (filters.fit_score_min && c.overall_fit_score < filters.fit_score_min) {
          return false;
        }
        if (filters.fit_score_max && c.overall_fit_score > filters.fit_score_max) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const sortKey = filters.sort_by || 'fit_score';
        let aVal: number = 0;
        let bVal: number = 0;

        if (sortKey === 'fit_score') {
          aVal = a.overall_fit_score;
          bVal = b.overall_fit_score;
        } else if (sortKey === 'trust_score') {
          aVal = a.recruiter_trust_score;
          bVal = b.recruiter_trust_score;
        } else if (sortKey === 'technical_fit') {
          aVal = a.technical_fit;
          bVal = b.technical_fit;
        } else if (sortKey === 'career_fit') {
          aVal = a.career_fit;
          bVal = b.career_fit;
        }

        return filters.sort_order === 'desc' ? bVal - aVal : aVal - bVal;
      });
  }, [candidates, searchTerm, filters]);

  const handleToggleSelect = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleViewDetails = (candidateId: string) => {
    navigate(`/candidate/${sessionId}/${candidateId}`);
  };

  const handleCompare = () => {
    if (selectedCandidates.length === 2) {
      navigate(`/compare/${sessionId}/${selectedCandidates[0]}/${selectedCandidates[1]}`);
    }
  };

  if (!sessionId) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {session?.role_title || 'Candidates'}
              </h1>
              <p className="text-gray-600">
                {candidates?.length || 0} candidates analyzed
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate(`/insights/${sessionId}`)}
                className="flex items-center gap-2"
              >
                <Download size={20} />
                Export
              </Button>
              <Button onClick={() => navigate('/')}>Home</Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filters.sort_by || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sort_by: e.target.value as any,
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fit_score">Overall Fit</option>
                <option value="trust_score">Trust Score</option>
                <option value="technical_fit">Technical Fit</option>
                <option value="career_fit">Career Fit</option>
              </select>

              <select
                value={filters.sort_order || 'desc'}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sort_order: e.target.value as 'asc' | 'desc',
                  })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Highest First</option>
                <option value="asc">Lowest First</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Compare Bar */}
        {selectedCandidates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between"
          >
            <span className="text-sm font-medium text-blue-900">
              {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCandidates([])}
              >
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

        {/* Candidates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonLoader key={i} count={1} className="h-80" />
            ))}
          </div>
        ) : !filteredCandidates || filteredCandidates.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={searchTerm ? 'No candidates found' : 'No candidates yet'}
            description={
              searchTerm
                ? `No candidates match "${searchTerm}". Try adjusting your search.`
                : 'Start a new hiring session to analyze candidates.'
            }
          />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCandidates.map((candidate, idx) => (
              <motion.div
                key={candidate.candidate_id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleToggleSelect(candidate.candidate_id)}
                className="cursor-pointer"
              >
                <CandidateCard
                  candidate={candidate}
                  isSelected={selectedCandidates.includes(candidate.candidate_id)}
                  onViewDetails={() => handleViewDetails(candidate.candidate_id)}
                  onCompare={() => {
                    if (selectedCandidates.length < 2) {
                      handleToggleSelect(candidate.candidate_id);
                    }
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WorkspacePage;
