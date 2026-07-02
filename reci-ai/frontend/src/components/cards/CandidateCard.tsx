import React from 'react';
import { motion } from 'framer-motion';
import type { CandidateProfile } from '../../types';
import { Card, Badge } from '../common';
import { formatScore, getRecommendationLabel } from '../../utils/formatters';
import { ChevronRight, GitCompare, MapPin, CheckCircle2 } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   Candidate Card
───────────────────────────────────────────────────────────────── */
interface CandidateCardProps {
  candidate: CandidateProfile;
  onViewDetails?: () => void;
  onCompare?: () => void;
  isSelected?: boolean;
  className?: string;
}

const getScoreMeta = (score: number): { color: string; bg: string } => {
  if (score >= 80) return { color: '#10B981', bg: '#D1FAE5' };
  if (score >= 60) return { color: '#4F46E5', bg: '#EEF2FF' };
  if (score >= 40) return { color: '#F59E0B', bg: '#FEF3C7' };
  return { color: '#64748B', bg: '#F1F5F9' };
};

const ScorePill: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const { color, bg } = getScoreMeta(value);
  return (
    <div className="flex flex-col items-center">
      <div
        className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ color, background: bg }}
      >
        {formatScore(value)}
      </div>
      <span className="text-[10px] text-slate-400 mt-1 font-medium">{label}</span>
    </div>
  );
};

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onViewDetails,
  onCompare,
  isSelected = false,
  className = '',
}) => {
  const rec = candidate.recommendation;
  const recVariant =
    rec === 'strong_match' ? 'success' :
    rec === 'good_match'   ? 'info' : 'warning';

  return (
    <div
      className={`reci-card reci-card-hover p-5 flex flex-col gap-4 cursor-pointer relative transition-all duration-200
        ${isSelected
          ? 'ring-2 ring-indigo-500 ring-offset-1'
          : 'hover:shadow-[0_8px_30px_rgba(79,70,229,0.08)]'
        }
        ${className}`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
            <CheckCircle2 size={14} className="text-white" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 pr-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {candidate.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 text-sm truncate">{candidate.name}</h3>
          {candidate.location && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-slate-400 flex-shrink-0" />
              <p className="text-xs text-slate-500 truncate">{candidate.location}</p>
            </div>
          )}
        </div>
        {candidate.rank && (
          <span className="text-[10px] font-bold text-slate-400 flex-shrink-0">#{candidate.rank}</span>
        )}
      </div>

      {/* Primary Scores */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Overall Fit</p>
          <p className="text-xl font-bold score-overall">{formatScore(candidate.overall_fit_score)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Trust Score</p>
          <p className="text-xl font-bold score-trust">{formatScore(candidate.recruiter_trust_score)}</p>
        </div>
      </div>

      {/* Sub Scores */}
      <div className="flex items-center justify-between px-1">
        <ScorePill label="Technical" value={candidate.technical_fit} />
        <div className="w-px h-6 bg-slate-100" />
        <ScorePill label="Career" value={candidate.career_fit} />
        <div className="w-px h-6 bg-slate-100" />
        <ScorePill label="Behavior" value={candidate.behavior_fit} />
      </div>

      {/* Recommendation */}
      <div className="flex items-center justify-between">
        <Badge variant={recVariant} size="sm">
          {getRecommendationLabel(rec)}
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-slate-100">
        {onViewDetails && (
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
            className="flex-1 flex items-center justify-center gap-1.5 btn btn-primary btn-sm"
          >
            View Details
            <ChevronRight size={13} />
          </button>
        )}
        {onCompare && (
          <button
            onClick={(e) => { e.stopPropagation(); onCompare(); }}
            className="btn btn-secondary btn-sm px-3"
            title="Add to Compare"
          >
            <GitCompare size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   Session Card  (used on Home page)
───────────────────────────────────────────────────────────────── */
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

const SESSION_STATUS: Record<string, { label: string; variant: 'neutral' | 'info' | 'primary' | 'warning' | 'success' | 'danger' }> = {
  new:               { label: 'New',          variant: 'neutral'  },
  job_uploaded:      { label: 'JD Uploaded',  variant: 'info'     },
  job_reviewed:      { label: 'Reviewed',     variant: 'primary'  },
  candidates_parsed: { label: 'Parsed',       variant: 'warning'  },
  processing:        { label: 'Processing',   variant: 'warning'  },
  completed:         { label: 'Completed',    variant: 'success'  },
  error:             { label: 'Error',        variant: 'danger'   },
};

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onOpen,
  onDelete,
  onExport,
  className = '',
}) => {
  const cfg = SESSION_STATUS[session.status] ?? { label: session.status, variant: 'neutral' as const };

  return (
    <Card hoverable className={`p-5 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 truncate text-sm" title={session.role_title}>
            {session.role_title}
          </h3>
          <p className="text-xs text-slate-400 font-mono truncate mt-0.5" title={session.session_id}>
            {session.session_id}
          </p>
        </div>
        <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-slate-100 mb-4 text-xs">
        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Created</p>
          <p className="font-medium text-slate-700">{new Date(session.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Candidates</p>
          <p className="font-medium text-slate-700">{session.candidate_count ?? '—'}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        {onOpen && (
          <button onClick={onOpen} className="flex-1 btn btn-primary btn-sm justify-center">
            Open
          </button>
        )}
        {onExport && (
          <button onClick={onExport} className="btn btn-secondary btn-sm px-3">
            Export
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="btn btn-ghost btn-sm px-2.5 text-red-500 hover:bg-red-50">
            Delete
          </button>
        )}
      </div>
    </Card>
  );
};
