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
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Session Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {session?.role_title || 'New Hiring Session'}
                </h1>
                <p className="text-gray-600">Session ID: {sessionId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-2">Status</p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {session?.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
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
            <Card className="p-6 h-full flex flex-col">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload size={24} />
                Job Description
              </h2>

              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'job')}
                className={`flex-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <p className="text-gray-600 mb-4">
                  Drag and drop your job description (DOCX or JSON)
                </p>

                <input
                  type="file"
                  accept=".docx,.json,.pdf"
                  onChange={(e) => e.target.files && setJobFile(e.target.files[0])}
                  className="hidden"
                  id="job-file"
                />

                <label
                  htmlFor="job-file"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer"
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
                  <span className="text-sm text-red-800">Upload failed. Please try again.</span>
                </div>
              )}

              {uploadJobMutation.isSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">✓ Job description uploaded successfully</p>
                </div>
              )}

              <Button
                onClick={handleUploadJob}
                loading={uploadJobMutation.isPending}
                disabled={!jobFile}
                className="mt-4 w-full"
              >
                Upload Job Description
              </Button>
            </Card>
          </motion.div>

          {/* Candidate Dataset Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 h-full flex flex-col">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload size={24} />
                Candidate Dataset
              </h2>

              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'candidate')}
                className={`flex-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <p className="text-gray-600 mb-4">
                  Drag and drop candidate data (CSV, JSON, or XLSX)
                </p>

                <input
                  type="file"
                  accept=".csv,.json,.xlsx"
                  onChange={(e) => e.target.files && setCandidateFile(e.target.files[0])}
                  className="hidden"
                  id="candidate-file"
                />

                <label
                  htmlFor="candidate-file"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer"
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
                  <span className="text-sm text-red-800">Upload failed. Please try again.</span>
                </div>
              )}

              {uploadCandidatesMutation.isSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">✓ Candidate data uploaded successfully</p>
                </div>
              )}

              <Button
                onClick={handleUploadCandidates}
                loading={uploadCandidatesMutation.isPending}
                disabled={!candidateFile}
                className="mt-4 w-full"
              >
                Upload Candidate Dataset
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex gap-4 justify-end"
        >
          <Button variant="secondary" onClick={() => navigate('/')}>
            Back
          </Button>
          <Button
            onClick={handleProceed}
            disabled={session?.status === 'new'}
          >
            Next: Review Job
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadPage;
