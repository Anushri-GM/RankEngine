import React from 'react';
import { motion } from 'framer-motion';
import type { CandidateProfile } from '../../types';
import { Card, Badge } from '../common';
import { formatScore, getScoreColor, getRecommendationLabel } from '../../utils/formatters';
import { ChevronRight, Award } from 'lucide-react';

interface CandidateCardProps {
  candidate: CandidateProfile;
  onViewDetails?: () => void;
  onCompare?: () => void;
  isSelected?: boolean;
  className?: string;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onViewDetails,
  onCompare,
  isSelected = false,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        hoverable
        className={`p-6 cursor-pointer relative border-2 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent'} ${className}`}
      >
        {isSelected && (
          <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-2">
            <Award size={16} />
          </div>
        )}

        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">{candidate.name}</h3>
          <p className="text-sm text-slate-600">{candidate.location}</p>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-slate-600 font-medium mb-1">Overall Fit</p>
            <p className={`text-2xl font-bold ${getScoreColor(candidate.overall_fit_score)}`}>
              {formatScore(candidate.overall_fit_score)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium mb-1">Trust Score</p>
            <p className={`text-2xl font-bold ${getScoreColor(candidate.recruiter_trust_score)}`}>
              {formatScore(candidate.recruiter_trust_score)}
            </p>
          </div>
        </div>

        {/* Fit Components */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Technical</p>
            <p className="text-sm font-semibold text-slate-900">{formatScore(candidate.technical_fit)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Career</p>
            <p className="text-sm font-semibold text-slate-900">{formatScore(candidate.career_fit)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Behavior</p>
            <p className="text-sm font-semibold text-slate-900">{formatScore(candidate.behavior_fit)}</p>
          </div>
        </div>

        {/* Recommendation */}
        <div className="mb-4">
          <Badge
            variant={candidate.recommendation === 'strong_match' ? 'success' : candidate.recommendation === 'good_match' ? 'info' : 'warning'}
            size="sm"
          >
            {getRecommendationLabel(candidate.recommendation)}
          </Badge>
        </div>

        {/* Rank */}
        {candidate.rank && (
          <div className="flex items-center justify-between mb-4 pb-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Rank #{candidate.rank}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {onViewDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              View Details
              <ChevronRight size={16} />
            </button>
          )}
          {onCompare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompare();
              }}
              className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition-colors"
            >
              Compare
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

interface SessionCardProps {
  session: {
    session_id: string;
    role_title: string;
    created_at: string;
    status: string;
    candidate_count?: number;
  };
  onOpen?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  className?: string;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onOpen,
  onDelete,
  onExport,
  className = '',
}) => {
  const statusColors = {
    new: 'bg-gray-100 text-gray-800',
    job_uploaded: 'bg-blue-100 text-blue-800',
    job_reviewed: 'bg-purple-100 text-purple-800',
    processing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <Card hoverable className={`p-6 ${className}`}>
      <div className="flex justify-between items-start mb-4 gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate" title={session.role_title}>
            {session.role_title}
          </h3>
          <p className="text-sm text-gray-600 font-mono truncate" title={session.session_id}>
            {session.session_id}
          </p>
        </div>
        <Badge variant="primary" size="sm" className={`flex-shrink-0 ${statusColors[session.status as keyof typeof statusColors] || 'bg-gray-100'}`}>
          {session.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-600 font-medium">Created</p>
          <p className="text-sm font-semibold text-gray-900">{new Date(session.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-medium">Candidates</p>
          <p className="text-sm font-semibold text-gray-900">{session.candidate_count || 'N/A'}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {onOpen && (
          <button
            onClick={onOpen}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Open
          </button>
        )}
        {onExport && (
          <button
            onClick={onExport}
            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
          >
            Export
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </Card>
  );
};
