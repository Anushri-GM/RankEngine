import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Loader } from '../components/ui/Loader';
import { useHealth } from '../hooks/useHealth';
import { Users, FileText, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: health, isLoading, isError, error } = useHealth();

  return (
    <PageContainer
      title="Dashboard"
      subtitle="Overview of Redrob Explainable Candidate Intelligence (RECI)"
      action={
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-card">
          <Activity className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">System Link:</span>
          {isLoading ? (
            <span className="inline-flex items-center text-xs font-semibold text-slate-400">
              <Loader size="sm" />
            </span>
          ) : isError ? (
            <StatusBadge status="danger" label="Connection Failed" />
          ) : (
            <StatusBadge status="success" label="Backend Connected" />
          )}
        </div>
      }
    >
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-blue-600 rounded-2xl shadow-premium text-white p-6 md:p-8 mb-8">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">RECI</h2>
          <p className="text-blue-100 font-medium text-sm md:text-base mt-1">
            Redrob Explainable Candidate Intelligence
          </p>
          <p className="text-blue-50/90 text-xs md:text-sm mt-4 leading-relaxed">
            Welcome to the foundational workspace. RECI uses explainable AI agents and advanced semantic matching to assess, score, and map candidate suitability without black-box opacity.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
          <ShieldCheck className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card hoverEffect={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Candidates</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">1,248</h3>
            </div>
            <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-primary">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[11px] text-slate-500">
            <span className="text-emerald-500 font-bold mr-1.5">↑ 12%</span>
            <span>from previous month</span>
          </div>
        </Card>

        <Card hoverEffect={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Parsed Resumes</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">1,192</h3>
            </div>
            <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-success">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[11px] text-slate-500">
            <span className="text-emerald-500 font-bold mr-1.5">↑ 8%</span>
            <span>ready for AI matching</span>
          </div>
        </Card>

        <Card hoverEffect={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Match Requests</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">432</h3>
            </div>
            <div className="h-10 w-10 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-warning">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[11px] text-slate-500">
            <span className="text-amber-500 font-bold mr-1.5">99.8%</span>
            <span>API response uptime</span>
          </div>
        </Card>
      </div>

      {/* Backend Status details */}
      <Card>
        <h4 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">Backend Core Status</h4>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <p className="font-semibold text-slate-400">Connection status</p>
              <p className={`font-bold mt-1 ${isError ? 'text-danger' : 'text-success'}`}>
                {isLoading ? 'Checking...' : isError ? 'Disconnected' : 'Connected'}
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <p className="font-semibold text-slate-400">Service Name</p>
              <p className="font-bold mt-1 text-slate-800">{health?.service || 'N/A'}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <p className="font-semibold text-slate-400">API version</p>
              <p className="font-bold mt-1 text-slate-800">{health?.version || 'N/A'}</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <p className="font-semibold text-slate-400">Environment</p>
              <p className="font-bold mt-1 text-slate-800">Development</p>
            </div>
          </div>

          {isError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700 mt-2">
              <p className="font-bold">Error Message:</p>
              <p className="mt-1">{error?.message || 'Failed to fetch backend health. Please check if your FastAPI server is running.'}</p>
            </div>
          )}
        </div>
      </Card>
    </PageContainer>
  );
};
