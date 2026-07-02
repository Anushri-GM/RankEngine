import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

export const Analytics: React.FC = () => {
  const matchDistributionData = [
    { range: '0-20%', count: 12 },
    { range: '21-40%', count: 48 },
    { range: '41-60%', count: 180 },
    { range: '61-80%', count: 412 },
    { range: '81-100%', count: 596 },
  ];

  const parsingVolumeData = [
    { name: 'Jan', resumes: 80 },
    { name: 'Feb', resumes: 120 },
    { name: 'Mar', resumes: 170 },
    { name: 'Apr', resumes: 220 },
    { name: 'May', resumes: 310 },
    { name: 'Jun', resumes: 432 },
  ];

  return (
    <PageContainer
      title="Analytics"
      subtitle="Visual insights and match distributions for processed candidate profiles."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match Score Distribution */}
        <Card>
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
            Match Score Distribution
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={matchDistributionData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="range" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 text-center">
            Represents the matching threshold density across the current candidate database.
          </p>
        </Card>

        {/* Resume Processing Volume */}
        <Card>
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
            Resume Ingestion Rate (H1 2026)
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={parsingVolumeData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorResumes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="resumes"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorResumes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 text-center">
            Tracks total candidate resume extractions processed monthly.
          </p>
        </Card>
      </div>
    </PageContainer>
  );
};
