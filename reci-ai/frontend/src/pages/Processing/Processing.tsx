import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSessionProcessingStatus, useSession } from '../../hooks/api/sessions';
import { useRankCandidates } from '../../hooks/api/candidates';
import { Card, Spinner } from '../../components/common';
import { ProcessingProgress } from '../../components/panels/EvidencePanel';
import { CheckCircle, AlertCircle } from 'lucide-react';

const PIPELINE_STEPS = [
  'Understanding Job',
  'Candidate Understanding',
  'Behavior Analysis',
  'Semantic Retrieval',
  'Re-ranking',
  'Explainability',
];

export const ProcessingPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data: session } = useSession(sessionId);
  const { data: processingStatus } = useSessionProcessingStatus(sessionId);
  const rankMutation = useRankCandidates();

  const [isCompleted, setIsCompleted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Trigger ranking on mount
  React.useEffect(() => {
    if (!sessionId || rankMutation.isPending || isCompleted) return;

    const triggerRanking = async () => {
      try {
        await rankMutation.mutateAsync(sessionId);
        setIsCompleted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Processing failed');
      }
    };

    // Small delay to ensure UI is ready
    const timer = setTimeout(triggerRanking, 500);
    return () => clearTimeout(timer);
  }, [sessionId, rankMutation, isCompleted]);

  const progress = processingStatus
    ? (processingStatus.progress || 0)
    : rankMutation.isPending
      ? 10
      : 0;

  const completedSteps = Math.floor((progress / 100) * PIPELINE_STEPS.length);

  React.useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        navigate(`/workspace/${sessionId}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, sessionId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Processing Candidates</h1>
          <p className="text-gray-600">
            AI is analyzing and ranking candidates based on job fit
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8">
            {error ? (
              <div className="text-center py-12">
                <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-600 mb-2">Processing Failed</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => navigate(`/job-review/${sessionId}`)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Back to Job Review
                </button>
              </div>
            ) : isCompleted ? (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Processing Complete!</h2>
                <p className="text-gray-600">
                  Redirecting to results...
                </p>
              </div>
            ) : (
              <ProcessingProgress
                currentStep={processingStatus?.current_step || PIPELINE_STEPS[0]}
                progress={progress}
                totalSteps={PIPELINE_STEPS.length}
                completedSteps={completedSteps}
                estimatedTimeRemaining={processingStatus?.estimated_time_remaining}
              />
            )}
          </Card>
        </motion.div>

        {/* Session Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-6 bg-white rounded-lg border border-gray-200"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600 font-medium">Session</p>
              <p className="text-gray-900 font-mono text-sm">{sessionId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Role</p>
              <p className="text-gray-900">{session?.role_title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Status</p>
              <p className="text-gray-900">{session?.status.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProcessingPage;
