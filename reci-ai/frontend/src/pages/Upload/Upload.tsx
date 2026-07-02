import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSession } from '../../hooks/api/sessions';
import { useUploadJobDescription, useUploadCandidateDataset } from '../../hooks/api/jobs';
import { Card, Button, ProgressBar, Spinner } from '../../components/common';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

export const UploadPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading: sessionLoading } = useSession(sessionId);
  const uploadJobMutation = useUploadJobDescription();
  const uploadCandidatesMutation = useUploadCandidateDataset();

  const [jobFile, setJobFile] = React.useState<File | null>(null);
  const [candidateFile, setCandidateFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent, type: 'job' | 'candidate') => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      if (type === 'job') setJobFile(file);
      else setCandidateFile(file);
    }
  };

  const handleUploadJob = async () => {
    if (!sessionId || !jobFile) return;
    try {
      await uploadJobMutation.mutateAsync({ session_id: sessionId, file: jobFile });
    } catch (error) {
      console.error('Failed to upload job description:', error);
    }
  };

  const handleUploadCandidates = async () => {
    if (!sessionId || !candidateFile) return;
    try {
      await uploadCandidatesMutation.mutateAsync({ session_id: sessionId, file: candidateFile });
    } catch (error) {
      console.error('Failed to upload candidate dataset:', error);
    }
  };

  const handleProceed = () => {
    if (session && session.status !== 'new') {
      navigate(`/job-review/${sessionId}`);
    }
  };

  if (sessionLoading || !sessionId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Session Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {session?.role_title || 'New Hiring Session'}
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{sessionId}</p>
              </div>
              <span className="badge badge-primary badge-sm">
                {session?.status.replace(/_/g, ' ')}
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Upload Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Description Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="upload-card-jd flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Upload size={16} className="text-indigo-600" />
                </div>
                <h2 className="font-semibold text-slate-900">Job Description</h2>
              </div>

              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'job')}
                className={`text-center py-6 rounded-xl transition-colors ${dragActive ? 'bg-indigo-50/50 border border-indigo-200' : ''}`}
              >
                <p className="text-sm text-slate-500 mb-3">
                  Drag & drop your job description (DOCX only)
                </p>

                <input
                  type="file"
                  accept=".docx"
                  onChange={(e) => e.target.files && setJobFile(e.target.files[0])}
                  className="hidden"
                  id="job-file"
                />

                <label
                  htmlFor="job-file"
                  className="btn btn-primary btn-sm cursor-pointer"
                >
                  Browse Files
                </label>
              </div>

              {jobFile && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="text-sm text-green-800">{jobFile.name}</span>
                </div>
              )}

              {uploadJobMutation.isPending && (
                <div className="mt-4 space-y-2">
                  <ProgressBar progress={50} animated />
                  <p className="text-sm text-gray-600">Uploading...</p>
                </div>
              )}

              {uploadJobMutation.isError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-600" />
                  <span className="text-sm text-red-800">
                    {(() => {
                      const err: any = uploadJobMutation.error;
                      if (err?.response?.data?.detail) return err.response.data.detail;
                      return err?.message || 'Upload failed. Please try again.';
                    })()}
                  </span>
                </div>
              )}

              {uploadJobMutation.isSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium">
                  ✓ Job description uploaded successfully
                </div>
              )}

              <Button
                onClick={handleUploadJob}
                loading={uploadJobMutation.isPending}
                disabled={!jobFile}
                className="w-full justify-center"
              >
                Upload Job Description
              </Button>
            </div>
          </motion.div>

          {/* Candidate Dataset Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="upload-card-candidates flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Upload size={16} className="text-emerald-600" />
                </div>
                <h2 className="font-semibold text-slate-900">Candidate Dataset</h2>
              </div>

              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'candidate')}
                className={`text-center py-6 rounded-xl transition-colors ${dragActive ? 'bg-emerald-50/50 border border-emerald-200' : ''}`}
              >
                <p className="text-sm text-slate-500 mb-3">
                  Drag & drop candidate data (JSON only)
                </p>

                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => e.target.files && setCandidateFile(e.target.files[0])}
                  className="hidden"
                  id="candidate-file"
                />

                <label
                  htmlFor="candidate-file"
                  className="btn btn-success btn-sm cursor-pointer"
                >
                  Browse Files
                </label>
              </div>

              {candidateFile && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="text-sm text-green-800">{candidateFile.name}</span>
                </div>
              )}

              {uploadCandidatesMutation.isPending && (
                <div className="mt-4 space-y-2">
                  <ProgressBar progress={50} animated />
                  <p className="text-sm text-gray-600">Uploading...</p>
                </div>
              )}

              {uploadCandidatesMutation.isError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-600" />
                  <span className="text-sm text-red-800">
                    {(() => {
                      const err: any = uploadCandidatesMutation.error;
                      if (err?.response?.data?.detail) return err.response.data.detail;
                      return err?.message || 'Upload failed. Please try again.';
                    })()}
                  </span>
                </div>
              )}

              {uploadCandidatesMutation.isSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium">
                  ✓ Candidate data uploaded successfully
                </div>
              )}

              <Button
                variant="success"
                onClick={handleUploadCandidates}
                loading={uploadCandidatesMutation.isPending}
                disabled={!candidateFile}
                className="w-full justify-center"
              >
                Upload Candidate Dataset
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 justify-end pt-2"
        >
          <Button variant="secondary" onClick={() => navigate('/')}>
            ← Back
          </Button>
          <Button
            onClick={handleProceed}
            disabled={session?.status === 'new'}
          >
            Next: Review Job →
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadPage;
