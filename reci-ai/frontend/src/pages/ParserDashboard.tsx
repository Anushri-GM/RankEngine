import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { apiClient } from '../api/client';
import { Upload, FileText, CheckCircle2, AlertTriangle, Cpu, Users, Database } from 'lucide-react';

interface JobData {
  role: {
    title: string;
    category: string;
    seniority: string;
  };
  industry: string;
  required_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  experience_requirement: {
    years: number;
    description: string;
  };
  education_requirement: {
    degree: string;
    major: string[];
  };
  employment_type: string;
  location: string;
  soft_skills: string[];
  inferred_expectations: string[];
}

interface ValidationReport {
  status: string;
  duplicate_ids: string[];
  missing_fields: string[];
  invalid_dates: string[];
  warnings: { field: string; message: string }[];
  failures: { field: string; message: string }[];
}

interface StatusData {
  job_description_parsed: boolean;
  candidates_parsed: number;
  behavior_profiles_generated: number;
}

export const ParserDashboard: React.FC = () => {
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [candidatesFile, setCandidatesFile] = useState<File | null>(null);
  const [uploadingJob, setUploadingJob] = useState(false);
  const [uploadingCandidates, setUploadingCandidates] = useState(false);
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [status, setStatus] = useState<StatusData | null>(null);
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch status metrics on mount
  const fetchStatus = async () => {
    try {
      const res = await apiClient.get<StatusData>('/understanding/status');
      setStatus(res.data);
    } catch (e) {
      console.error("Failed to load status details", e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleJobUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobFile) return;

    setUploadingJob(true);
    setErrorMsg('');
    const formData = new FormData();
    formData.append('file', jobFile);

    try {
      const res = await apiClient.post<JobData>('/understanding/job', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setJobData(res.data);
      fetchStatus();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload and parse Job Description.');
    } finally {
      setUploadingJob(false);
    }
  };

  const handleCandidatesUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidatesFile) return;

    setUploadingCandidates(true);
    setErrorMsg('');
    const formData = new FormData();
    formData.append('file', candidatesFile);

    try {
      const res = await apiClient.post<any>('/understanding/candidates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCandidatesCount(res.data.candidates_count);
      setValidationReport(res.data.validation_report);
      fetchStatus();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload and parse Candidates dataset.');
    } finally {
      setUploadingCandidates(false);
    }
  };

  return (
    <PageContainer
      title="Parser Dashboard"
      subtitle="Upload Redrob raw files to extract job expectations, validate parameters, and structure candidate behaviors."
    >
      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-medium">
          <p className="font-bold flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Upload Error
          </p>
          <p className="mt-1 ml-6">{errorMsg}</p>
        </div>
      )}

      {/* Overview Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverEffect={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Parsed Status</p>
              <h3 className="text-xl font-bold text-slate-800 mt-2">
                {status?.job_description_parsed ? 'Parsed & Loaded' : 'Not Loaded'}
              </h3>
            </div>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${
              status?.job_description_parsed 
                ? 'bg-blue-50 border-blue-100 text-primary' 
                : 'bg-slate-50 border-slate-100 text-slate-500'
            }`}>
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            {status?.job_description_parsed ? (
              <StatusBadge status="success" label="Active Job Profile" />
            ) : (
              <StatusBadge status="warning" label="Upload JD to start" />
            )}
          </div>
        </Card>

        <Card hoverEffect={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidates Ingested</p>
              <h3 className="text-xl font-bold text-slate-800 mt-2">
                {status?.candidates_parsed || 0} Profiles
              </h3>
            </div>
            <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center text-success">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <StatusBadge 
              status={status && status.candidates_parsed > 0 ? "success" : "info"} 
              label={status && status.candidates_parsed > 0 ? "Ready for Matcher" : "No dataset parsed"} 
            />
          </div>
        </Card>

        <Card hoverEffect={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Behaviors Resolved</p>
              <h3 className="text-xl font-bold text-slate-800 mt-2">
                {status?.behavior_profiles_generated || 0} Vectors
              </h3>
            </div>
            <div className="h-10 w-10 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-warning">
              <Cpu className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <StatusBadge 
              status={status && status.behavior_profiles_generated > 0 ? "success" : "info"} 
              label={status && status.behavior_profiles_generated > 0 ? "Behaviors Parsed" : "Pending ingest"} 
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Upload Panels */}
        <div className="space-y-6">
          {/* Upload Job Description */}
          <Card>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center">
              <Upload className="h-4 w-4 mr-2 text-slate-500" />
              Upload Job Description (.docx)
            </h3>
            <form onSubmit={handleJobUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 transition-colors">
                <FileText className="h-8 w-8 text-slate-500 mb-2" />
                <span className="text-xs font-semibold text-slate-600">Select Word Document</span>
                <input
                  type="file"
                  accept=".docx"
                  onChange={(e) => setJobFile(e.target.files ? e.target.files[0] : null)}
                  className="mt-2 text-xs text-slate-500"
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!jobFile || uploadingJob} 
                  isLoading={uploadingJob}
                  variant="primary"
                >
                  Parse Job Description
                </Button>
              </div>
            </form>
          </Card>

          {/* Upload Candidate Dataset */}
          <Card>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center">
              <Database className="h-4 w-4 mr-2 text-slate-500" />
              Upload Candidate Dataset (.json)
            </h3>
            <form onSubmit={handleCandidatesUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 transition-colors">
                <FileText className="h-8 w-8 text-slate-500 mb-2" />
                <span className="text-xs font-semibold text-slate-600">Select JSON Dataset</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setCandidatesFile(e.target.files ? e.target.files[0] : null)}
                  className="mt-2 text-xs text-slate-500"
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!candidatesFile || uploadingCandidates} 
                  isLoading={uploadingCandidates}
                  variant="success"
                >
                  Parse Candidate Dataset
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Output Displays */}
        <div className="space-y-6">
          {/* Job Summary output */}
          {jobData && (
            <Card>
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
                Job Understanding Profile
              </h3>
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-500">Target Role</p>
                    <p className="font-bold text-slate-800 mt-0.5">{jobData.role.title}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-500">Role Category</p>
                    <p className="font-bold text-slate-800 mt-0.5">{jobData.role.category}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-500">Seniority</p>
                    <p className="font-bold text-slate-800 mt-0.5">{jobData.role.seniority}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-500">Industry Exposure</p>
                    <p className="font-bold text-slate-800 mt-0.5">{jobData.industry}</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-slate-600 mb-1">Required Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {jobData.required_skills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-primary border border-blue-100 rounded text-[10px] font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-slate-600 mb-1">Inferred Hidden Expectations</p>
                  <div className="flex flex-wrap gap-1.5">
                    {jobData.inferred_expectations.map((e, i) => (
                      <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[10px] font-semibold">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Validation report output */}
          {validationReport && (
            <Card>
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center">
                {validationReport.status === 'Valid' ? (
                  <CheckCircle2 className="h-4 w-4 mr-2 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-2 text-warning" />
                )}
                Validation Report Status: {validationReport.status}
              </h3>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-500">Parsed Candidate Count</p>
                    <p className="font-bold text-slate-800 mt-0.5">{candidatesCount}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-500">Duplicate Candidate IDs</p>
                    <p className="font-bold text-slate-800 mt-0.5">{validationReport.duplicate_ids.length}</p>
                  </div>
                </div>

                {validationReport.warnings.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="font-bold text-warning flex items-center">
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                      Ingestion Warnings ({validationReport.warnings.length})
                    </p>
                    <ul className="list-disc pl-5 text-[10px] text-slate-600 max-h-32 overflow-y-auto space-y-0.5">
                      {validationReport.warnings.map((w, i) => (
                        <li key={i}>{w.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
