import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCandidateDetail, useFitScoreBreakdown } from '../../hooks/api/candidates';
import { Card, Button, Spinner, Badge } from '../../components/common';
import { FitScore, ScoreBreakdown, SkillChip as SkillChipComponent } from '../../components/panels/ScorePanel';
import { EvidencePanel } from '../../components/panels/EvidencePanel';
import { formatScore } from '../../utils/formatters';
import { ChevronLeft, Mail, Phone, MapPin } from 'lucide-react';

export const CandidateDetailPage: React.FC = () => {
  const { sessionId, candidateId } = useParams<{ sessionId: string; candidateId: string }>();
  const navigate = useNavigate();
  const { data: candidate, isLoading: candidateLoading } = useCandidateDetail(sessionId, candidateId);
  const { data: fitBreakdown, isLoading: fitLoading } = useFitScoreBreakdown(sessionId, candidateId);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'experience' | 'skills' | 'evidence'>('overview');

  if (candidateLoading || fitLoading || !candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-10"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(`/workspace/${sessionId}`)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ChevronLeft size={20} />
              Back to Candidates
            </button>
            <Button onClick={() => navigate(`/workspace/${sessionId}`)}>Close</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Candidate Info */}
            <div className="md:col-span-1">
              <h1 className="text-3xl font-bold text-gray-900">{candidate.name}</h1>
              <p className="text-gray-600 mb-4">{candidate.location}</p>

              <div className="space-y-2 text-sm">
                {candidate.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={16} />
                    {candidate.email}
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} />
                    {candidate.phone}
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} />
                    {candidate.location}
                  </div>
                )}
              </div>
            </div>

            {/* Scores */}
            <div className="md:col-span-2 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Overall Fit</p>
                <FitScore score={candidate.overall_fit_score} size="md" showLabel={false} />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Trust Score</p>
                <FitScore score={candidate.recruiter_trust_score} size="md" showLabel={false} />
              </div>
              <div className="text-center">
                <Badge variant="success" className="w-full text-center">
                  {candidate.recommendation.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-20 z-10"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {['overview', 'experience', 'skills', 'evidence'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {fitBreakdown && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Fit Score Breakdown</h2>
                  <ScoreBreakdown breakdown={fitBreakdown} />
                </Card>
              )}

              {candidate.summary && (
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>
                  <p className="text-gray-700">{candidate.summary}</p>
                </Card>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <p className="text-xs text-gray-600 mb-1">Technical Fit</p>
                  <p className="text-2xl font-bold text-blue-600">{formatScore(candidate.technical_fit)}</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-xs text-gray-600 mb-1">Career Fit</p>
                  <p className="text-2xl font-bold text-purple-600">{formatScore(candidate.career_fit)}</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-xs text-gray-600 mb-1">Behavior Fit</p>
                  <p className="text-2xl font-bold text-green-600">{formatScore(candidate.behavior_fit)}</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-xs text-gray-600 mb-1">Experience Fit</p>
                  <p className="text-2xl font-bold text-orange-600">{formatScore(candidate.experience_fit)}</p>
                </Card>
              </div>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              {candidate.experience.map((exp, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                      <p className="text-gray-600">{exp.company}</p>
                    </div>
                    <span className="text-sm text-gray-600">{exp.duration}</span>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 mb-3">{exp.description}</p>
                  )}
                  {exp.skills && exp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {exp.skills.map((skill) => (
                        <Badge key={skill} variant="info" size="sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {candidate.matched_skills.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Matched Skills</h3>
                  <div className="space-y-3">
                    {candidate.matched_skills.map((skill, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{skill.skill_name}</p>
                          <Badge variant="success" size="sm">
                            {skill.match_type}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {skill.evidence.map((ev, evIdx) => (
                            <div key={evIdx}>
                              • {ev.source_name} ({ev.source_type})
                              {ev.verified && ' ✓'}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {candidate.missing_skills.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {candidate.missing_skills.map((skill) => (
                      <SkillChipComponent key={skill.name} skill={skill.name} />
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Evidence Tab */}
          {activeTab === 'evidence' && (
            <div>
              {candidate.evidence ? (
                <EvidencePanel evidence={candidate.evidence} />
              ) : (
                <Card className="p-12 text-center text-slate-500">
                  <p>No evidence data available</p>
                </Card>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CandidateDetailPage;
