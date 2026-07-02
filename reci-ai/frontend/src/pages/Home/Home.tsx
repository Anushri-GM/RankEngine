import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSessions, useCreateSession } from '../../hooks/api/sessions';
import { Button, Card, EmptyState, SkeletonLoader } from '../../components/common';
import { SessionCard } from '../../components/cards/CandidateCard';
import { Plus, FileText, BarChart3 } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: sessions, isLoading } = useSessions();
  const createSessionMutation = useCreateSession();
  const [roleTitle, setRoleTitle] = React.useState('');

  const handleCreateSession = async () => {
    if (!roleTitle.trim()) return;
    try {
      const newSession = await createSessionMutation.mutateAsync(roleTitle);
      navigate(`/upload/${newSession.session_id}`);
      setRoleTitle('');
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">RECI</h1>
          <p className="text-xl text-blue-100 mb-8">
            Redrob Explainable Candidate Intelligence
          </p>
          <p className="text-lg text-blue-50 max-w-2xl mx-auto">
            Transform your recruitment process with AI-powered candidate ranking and explainable decision intelligence.
          </p>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {sessions?.length || 0}
            </div>
            <p className="text-gray-600">Active Sessions</p>
          </Card>
          <Card className="p-6 text-center">
            <FileText size={32} className="text-green-600 mx-auto mb-2" />
            <p className="text-gray-600">AI-Powered Analysis</p>
          </Card>
          <Card className="p-6 text-center">
            <BarChart3 size={32} className="text-purple-600 mx-auto mb-2" />
            <p className="text-gray-600">Explainable Results</p>
          </Card>
        </motion.div>

        {/* Create New Session */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Start New Hiring Session</h2>

            <div className="flex gap-4 flex-col sm:flex-row">
              <input
                type="text"
                placeholder="Enter job title (e.g., Senior Software Engineer)"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={handleCreateSession}
                loading={createSessionMutation.isPending}
                className="inline-flex items-center gap-2"
                aria-label="Create a new hiring session"
              >
                <Plus size={20} />
                Create Session
              </Button>
            </div>

            {createSessionMutation.isError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                <p className="font-semibold">Failed to create session</p>
                <p className="text-xs mt-1 text-red-700">
                  {createSessionMutation.error instanceof Error ? createSessionMutation.error.message : 'Please try again.'}
                </p>
                <p className="text-xs mt-1 text-slate-500 font-medium">
                  Tip: Make sure the backend is running by executing <code className="bg-slate-100 px-1 py-0.5 rounded">start_backend.bat</code>.
                </p>
              </div>
            )}
          </Card>
        </motion.div>

        <div className="mb-8 flex justify-end">
          <Button onClick={() => navigate('/demo')} aria-label="Start demo mode">Start Demo</Button>
        </div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Sessions</h2>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonLoader key={i} count={1} className="h-40" />
              ))}
            </div>
          ) : !sessions || sessions.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No Sessions Yet"
              description="Create your first hiring session to get started with AI-powered candidate ranking."
              action={
                <Button
                  onClick={() => {
                    const title = prompt('Enter job title:');
                    if (title) {
                      setRoleTitle(title);
                      handleCreateSession();
                    }
                  }}
                  aria-label="Create your first session"
                >
                  <Plus size={20} />
                  Create First Session
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <motion.div
                  key={session.session_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ y: -4 }}
                >
                  <SessionCard
                    session={session}
                    onOpen={() => {
                      if (session.status === 'new') {
                        navigate(`/upload/${session.session_id}`);
                      } else {
                        navigate(`/workspace/${session.session_id}`);
                      }
                    }}
                    onExport={() => navigate(`/insights/${session.session_id}`)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
