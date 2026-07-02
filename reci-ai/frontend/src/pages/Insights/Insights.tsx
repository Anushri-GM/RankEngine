import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInsights, useExportResults } from '../../hooks/api/insights';
import { useSession } from '../../hooks/api/sessions';
import { Card, Button, Spinner, Badge, EmptyState } from '../../components/common';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export const InsightsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data: session } = useSession(sessionId);
  const { data: insights, isLoading } = useInsights(sessionId);
  const exportMutation = useExportResults();
  const [exportFormat, setExportFormat] = React.useState<'json' | 'csv' | 'pdf'>('json');

  const handleExport = async () => {
    if (!sessionId) return;
    await exportMutation.mutateAsync({
      session_id: sessionId,
      options: {
        format: exportFormat,
        include_rankings: true,
        include_fit_scores: true,
        include_trust_scores: true,
        include_evidence: true,
        include_matched_skills: true,
        include_missing_skills: true,
      },
    });
  };

  if (isLoading || !sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState
          icon="📊"
          title="No insights available"
          description="Complete the ranking process to view insights."
          action={<Button onClick={() => navigate('/')}>Back Home</Button>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recruiting Insights</h1>
              <p className="text-gray-600">{session?.role_title}</p>
            </div>
            <Button onClick={() => navigate(`/workspace/${sessionId}`)}>Back to Workspace</Button>
          </div>

          {/* Export Section */}
          <Card className="p-4 bg-blue-50 border border-blue-200 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Export Results</h3>
              <p className="text-sm text-gray-600">Download ranking results in your preferred format</p>
            </div>
            <div className="flex gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF Report</option>
              </select>
              <Button
                onClick={handleExport}
                loading={exportMutation.isPending}
                className="flex items-center gap-2"
              >
                <Download size={20} />
                Export
              </Button>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 text-center">
              <p className="text-gray-600 mb-2">Total Candidates</p>
              <p className="text-3xl font-bold text-blue-600">{insights.total_candidates_analyzed}</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-gray-600 mb-2">Average Fit Score</p>
              <p className="text-3xl font-bold text-green-600">{insights.average_fit_score.toFixed(1)}</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-gray-600 mb-2">Average Experience</p>
              <p className="text-3xl font-bold text-purple-600">{insights.average_experience_years.toFixed(1)}y</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-gray-600 mb-2">Processing Time</p>
              <p className="text-3xl font-bold text-orange-600">{(insights.processing_time_ms / 1000).toFixed(1)}s</p>
            </Card>
          </div>

          {/* Score Distribution */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Fit Score Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={insights.score_distribution.bins.map((bin, idx) => ({
                name: `${bin}-${bin + 10}`,
                candidates: insights.score_distribution.counts[idx],
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="candidates" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Experience Distribution */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Experience Level Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Junior (0-2y)', value: insights.experience_distribution.junior_0_2 },
                    { name: 'Mid (2-5y)', value: insights.experience_distribution.mid_2_5 },
                    { name: 'Senior (5-10y)', value: insights.experience_distribution.senior_5_10 },
                    { name: 'Lead (10+y)', value: insights.experience_distribution.lead_10_plus },
                  ].filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(Math.round((percent ?? 0) * 100))}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {CHART_COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Top Skills */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Top {Math.min(10, insights.top_skills.length)} Skills</h2>
            <div className="space-y-4">
              {insights.top_skills.slice(0, 10).map((skill, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{skill.skill}</span>
                    <Badge variant="primary" size="sm">
                      {skill.frequency} candidates
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(skill.frequency / Math.max(...insights.top_skills.map(s => s.frequency))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Trust Score Distribution */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Trust Score Distribution</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-medium">High Trust (75+)</p>
                <p className="text-2xl font-bold text-green-600">{insights.trust_distribution.high_trust_75_plus}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">Good Trust (60-75)</p>
                <p className="text-2xl font-bold text-blue-600">{insights.trust_distribution.good_trust_60_75}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-700 font-medium">Moderate (40-60)</p>
                <p className="text-2xl font-bold text-yellow-600">{insights.trust_distribution.moderate_trust_40_60}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 font-medium">Low Trust (&lt;40)</p>
                <p className="text-2xl font-bold text-red-600">{insights.trust_distribution.low_trust_below_40}</p>
              </div>
            </div>
          </Card>

          {/* Behavior Traits */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Behavior Traits Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { trait: 'Leadership', avg: insights.behavior_distribution.leadership },
                { trait: 'Collaboration', avg: insights.behavior_distribution.collaboration },
                { trait: 'Problem Solving', avg: insights.behavior_distribution.problem_solving },
                { trait: 'Communication', avg: insights.behavior_distribution.communication },
                { trait: 'Adaptability', avg: insights.behavior_distribution.adaptability },
                { trait: 'Initiative', avg: insights.behavior_distribution.initiative },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trait" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="avg" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InsightsPage;
