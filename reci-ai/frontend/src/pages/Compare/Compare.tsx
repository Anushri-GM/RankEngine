import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCandidateDetail, useCompareCandidates } from '../../hooks/api/candidates';
import { Card, Spinner } from '../../components/common';
import { FitScore } from '../../components/panels/ScorePanel';
import { formatScore } from '../../utils/formatters';
import { ChevronLeft, ArrowUp, ArrowDown } from 'lucide-react';

export const ComparePage: React.FC = () => {
  const { sessionId, candidateId1, candidateId2 } = useParams<{
    sessionId: string;
    candidateId1: string;
    candidateId2: string;
  }>();
  const navigate = useNavigate();

  const { data: candidate1, isLoading: loading1 } = useCandidateDetail(sessionId, candidateId1);
  const { data: candidate2, isLoading: loading2 } = useCandidateDetail(sessionId, candidateId2);
  useCompareCandidates(sessionId, candidateId1, candidateId2);

  if (loading1 || loading2 || !candidate1 || !candidate2) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const compareMetric = (val1: number, val2: number) => {
    const diff = val1 - val2;
    if (Math.abs(diff) < 1) return { winner: 'tie', diff: 0 };
    return {
      winner: diff > 0 ? 'candidate1' : 'candidate2',
      diff: Math.abs(diff),
    };
  };

  const metrics = [
    { label: 'Overall Fit', c1: candidate1.overall_fit_score, c2: candidate2.overall_fit_score },
    { label: 'Trust Score', c1: candidate1.recruiter_trust_score, c2: candidate2.recruiter_trust_score },
    { label: 'Technical Fit', c1: candidate1.technical_fit, c2: candidate2.technical_fit },
    { label: 'Career Fit', c1: candidate1.career_fit, c2: candidate2.career_fit },
    { label: 'Behavior Fit', c1: candidate1.behavior_fit, c2: candidate2.behavior_fit },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(`/workspace/${sessionId}`)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ChevronLeft size={20} />
            Back to Candidates
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Candidates</h1>

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Candidate 1 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-1"
            >
              <Card className="p-6 text-center border-2 border-blue-500">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{candidate1.name}</h2>
                <p className="text-gray-600 mb-4">{candidate1.location}</p>
                <FitScore score={candidate1.overall_fit_score} size="lg" showLabel={false} />
              </Card>
            </motion.div>

            {/* Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-1"
            >
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Comparison</h3>
                <div className="space-y-4">
                  {metrics.map((metric) => {
                    const comparison = compareMetric(metric.c1, metric.c2);
                    return (
                      <div key={metric.label} className="text-sm">
                        <p className="font-medium text-gray-700 mb-2">{metric.label}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{formatScore(metric.c1)}</span>
                          {comparison.winner === 'candidate1' ? (
                            <ArrowUp size={16} className="text-green-600" />
                          ) : comparison.winner === 'candidate2' ? (
                            <ArrowDown size={16} className="text-red-600" />
                          ) : (
                            <div className="w-4 h-4 bg-gray-300 rounded-full" />
                          )}
                          <span className="text-xs text-gray-600">{formatScore(metric.c2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            {/* Candidate 2 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-1"
            >
              <Card className="p-6 text-center border-2 border-green-500">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{candidate2.name}</h2>
                <p className="text-gray-600 mb-4">{candidate2.location}</p>
                <FitScore score={candidate2.overall_fit_score} size="lg" showLabel={false} />
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Detailed Comparison */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Experience Comparison */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Experience</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{candidate1.name}</h3>
                <div className="space-y-2">
                  {candidate1.experience.slice(0, 3).map((exp, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      <p className="font-medium">{exp.title}</p>
                      <p className="text-gray-600">{exp.company}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{candidate2.name}</h3>
                <div className="space-y-2">
                  {candidate2.experience.slice(0, 3).map((exp, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      <p className="font-medium">{exp.title}</p>
                      <p className="text-gray-600">{exp.company}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Skills Comparison */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Top Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{candidate1.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate1.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill.name}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{candidate2.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {candidate2.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill.name}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Education Comparison */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Education</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{candidate1.name}</h3>
                <div className="space-y-2">
                  {candidate1.education.map((edu, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      <p className="font-medium">{edu.degree} in {edu.field}</p>
                      <p className="text-gray-600">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">{candidate2.name}</h3>
                <div className="space-y-2">
                  {candidate2.education.map((edu, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      <p className="font-medium">{edu.degree} in {edu.field}</p>
                      <p className="text-gray-600">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ComparePage;
