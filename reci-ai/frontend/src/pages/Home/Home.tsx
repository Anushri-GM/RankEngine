import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSessions, useCreateSession, useDeleteSession } from '../../hooks/api/sessions';
import { Button, Card, Badge, EmptyState, SkeletonLoader } from '../../components/common';
import {
  Plus,
  Briefcase,
  Users,
  BarChart3,
  Zap,
  Trash2,
  ArrowRight,
  LineChart,
  Clock,
} from 'lucide-react';

const STAGGER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const ITEM = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: sessions, isLoading } = useSessions();
  const createMutation = useCreateSession();
  const deleteMutation = useDeleteSession();
  const [roleTitle, setRoleTitle] = React.useState('');

  const totalCandidates = sessions?.reduce((s, x) => s + (x.candidate_count ?? 0), 0) ?? 0;
  const completedSessions = sessions?.filter(s => s.status === 'completed').length ?? 0;

  const handleCreate = async () => {
    if (!roleTitle.trim()) return;
    try {
      const s = await createMutation.mutateAsync(roleTitle.trim());
      setRoleTitle('');
      navigate(`/upload/${s.session_id}`);
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this session and all its data?')) return;
    try { await deleteMutation.mutateAsync(id); } catch {}
  };

  const handleOpen = (session: { session_id: string; status: string }) => {
    if      (session.status === 'new')          navigate(`/upload/${session.session_id}`);
    else if (session.status === 'job_uploaded') navigate(`/job-review/${session.session_id}`);
    else if (session.status === 'job_reviewed') navigate(`/processing/${session.session_id}`);
    else                                        navigate(`/workspace/${session.session_id}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* ── Hero Banner ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="reci-hero"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/20 mb-4">
              <Zap size={12} className="text-indigo-300" />
              <span className="text-xs font-semibold text-indigo-300 tracking-wide">AI-Powered Recruitment Intelligence</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2" style={{ letterSpacing: '-0.03em' }}>
              Welcome to <span className="text-indigo-300">RECI</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
              Rank, explain, and understand your candidates with enterprise-grade AI. Every decision is transparent, every score is earned.
            </p>
          </div>

          <div className="flex flex-col gap-3 min-w-fit">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/demo')}
              className="justify-center"
            >
              <Zap size={16} />
              Try Demo
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── KPI Row ─────────────────────────────────────────── */}
      <motion.div
        variants={STAGGER}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          {
            label: 'Total Sessions',
            value: sessions?.length ?? 0,
            icon: Briefcase,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
          },
          {
            label: 'Candidates Analyzed',
            value: totalCandidates,
            icon: Users,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Completed Sessions',
            value: completedSessions,
            icon: BarChart3,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
          },
          {
            label: 'AI Accuracy',
            value: '94.2%',
            icon: LineChart,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={ITEM} className="kpi-card">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={17} className={kpi.color} />
              </div>
            </div>
            <div className={`kpi-value ${kpi.color}`}>{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── New Session ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.25 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title">Start a New Hiring Session</h2>
              <p className="section-subtitle mt-0.5">Enter a job title to begin the AI ranking pipeline.</p>
            </div>
          </div>

          <div className="flex gap-3 flex-col sm:flex-row">
            <input
              type="text"
              className="reci-input flex-1"
              placeholder="e.g. Senior Machine Learning Engineer"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button
              onClick={handleCreate}
              loading={createMutation.isPending}
              disabled={!roleTitle.trim()}
              className="sm:w-auto w-full justify-center"
            >
              <Plus size={16} />
              Create Session
            </Button>
          </div>

          {createMutation.isError && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              <span className="font-semibold">Failed to create session.</span>{' '}
              {window.location.hostname === 'localhost'
                ? 'Make sure the backend is running via start_backend.bat.'
                : 'Ensure VITE_API_URL is set in Vercel settings.'}
            </div>
          )}
        </Card>
      </motion.div>

      {/* ── Recent Sessions ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.25 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="section-title">Recent Sessions</h2>
            <p className="section-subtitle">{sessions?.length ?? 0} session{sessions?.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>

        {isLoading ? (
          <SkeletonLoader count={3} className="h-40" />
        ) : !sessions || sessions.length === 0 ? (
          <Card className="p-6">
            <EmptyState
              icon={<Briefcase size={22} className="text-slate-400" />}
              title="No sessions yet"
              description="Create your first hiring session above to start ranking candidates with AI."
            />
          </Card>
        ) : (
          <motion.div
            variants={STAGGER}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {sessions.map((session) => {
              const cfg = STATUS_CONFIG[session.status] ?? { label: session.status, variant: 'neutral' as const };
              return (
                <motion.div key={session.session_id} variants={ITEM}>
                  <Card hoverable className="p-5 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0 flex-1">
                        <h3
                          className="font-semibold text-slate-900 truncate text-sm"
                          title={session.role_title}
                        >
                          {session.role_title}
                        </h3>
                        <p
                          className="text-xs text-slate-400 font-mono truncate mt-0.5"
                          title={session.session_id}
                        >
                          {session.session_id}
                        </p>
                      </div>
                      <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                    </div>

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-slate-100 mb-4">
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Created</p>
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} className="text-slate-400" />
                          <p className="text-xs font-medium text-slate-700">
                            {new Date(session.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Candidates</p>
                        <div className="flex items-center gap-1.5">
                          <Users size={11} className="text-slate-400" />
                          <p className="text-xs font-medium text-slate-700">{session.candidate_count ?? '—'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleOpen(session)}
                        className="flex-1 flex items-center justify-center gap-1.5 btn btn-primary btn-sm"
                      >
                        Open
                        <ArrowRight size={13} />
                      </button>
                      <button
                        onClick={() => navigate(`/insights/${session.session_id}`)}
                        className="btn btn-secondary btn-sm px-2.5"
                        title="Insights"
                      >
                        <BarChart3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(session.session_id)}
                        className="btn btn-ghost btn-sm px-2.5 text-red-500 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default HomePage;
