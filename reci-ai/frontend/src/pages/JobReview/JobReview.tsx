import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useJobUnderstanding, useUpdateJobUnderstanding, useConfirmJobUnderstanding } from '../../hooks/api/jobs';
import { useSession } from '../../hooks/api/sessions';
import { Card, Button, Spinner } from '../../components/common';
import { SkillChip } from '../../components/panels/ScorePanel';
import { CheckCircle, Edit2 } from 'lucide-react';

export const JobReviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  useSession(sessionId);
  const { data: jobUnderstanding, isLoading: jobLoading } = useJobUnderstanding(sessionId);
  const updateJobMutation = useUpdateJobUnderstanding();
  const confirmJobMutation = useConfirmJobUnderstanding();

  const [isEditing, setIsEditing] = React.useState(false);
  const [editedJob, setEditedJob] = React.useState(jobUnderstanding ?? undefined);

  React.useEffect(() => {
    if (jobUnderstanding) {
      setEditedJob(jobUnderstanding);
    }
  }, [jobUnderstanding]);

  const handleConfirm = async () => {
    if (!sessionId) return;
    try {
      await confirmJobMutation.mutateAsync(sessionId);
      navigate(`/processing/${sessionId}`);
    } catch (error) {
      console.error('Failed to confirm job:', error);
    }
  };

  const handleSaveEdits = async () => {
    if (!sessionId || !editedJob) return;
    try {
      await updateJobMutation.mutateAsync({ session_id: sessionId, job: editedJob });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update job:', error);
    }
  };

  if (jobLoading || !sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!jobUnderstanding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">Job description not found. Please upload it first.</p>
          <Button onClick={() => navigate(`/upload/${sessionId}`)}>
            Go to Upload
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Review Job Understanding</h1>
            <Button
              variant="ghost"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              <Edit2 size={20} />
              {isEditing ? 'Done Editing' : 'Edit'}
            </Button>
          </div>
          <p className="text-gray-600">
            Review the AI's understanding of the job before proceeding to ranking
          </p>
        </motion.div>

        {/* Job Details */}
        <div className="space-y-6">
          {/* Role Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Role Title</h2>
              {isEditing ? (
                <input
                  type="text"
                  value={editedJob?.role_title || ''}
                  onChange={(e) =>
                    setEditedJob(
                      editedJob ? { ...editedJob, role_title: e.target.value } : undefined
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-lg text-gray-700">{jobUnderstanding.role_title}</p>
              )}
            </Card>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Required Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-red-500" />
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {jobUnderstanding.required_skills.map((skill) => (
                    <SkillChip
                      key={skill.name}
                      skill={skill.name}
                      proficiency={skill.proficiency}
                    />
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Preferred Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {jobUnderstanding.preferred_skills.map((skill) => (
                    <SkillChip
                      key={skill.name}
                      skill={skill.name}
                      proficiency={skill.proficiency}
                    />
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Key Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobUnderstanding.experience_required && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Experience Required
                    </label>
                    <p className="text-gray-900">{jobUnderstanding.experience_required}</p>
                  </div>
                )}

                {jobUnderstanding.industry && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Industry
                    </label>
                    <p className="text-gray-900">{jobUnderstanding.industry}</p>
                  </div>
                )}

                {jobUnderstanding.education_requirement && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Education Requirement
                    </label>
                    <p className="text-gray-900">{jobUnderstanding.education_requirement}</p>
                  </div>
                )}

                {jobUnderstanding.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Location
                    </label>
                    <p className="text-gray-900">{jobUnderstanding.location}</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Responsibilities */}
          {jobUnderstanding.responsibilities && jobUnderstanding.responsibilities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsibilities</h3>
                <ul className="space-y-2">
                  {jobUnderstanding.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex gap-3 text-gray-700">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          )}

          {/* Edit Actions */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 justify-end pt-6 border-t border-gray-200"
            >
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setEditedJob(jobUnderstanding);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdits}
                loading={updateJobMutation.isPending}
              >
                Save Changes
              </Button>
            </motion.div>
          )}

          {/* Proceed Actions */}
          {!isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4 justify-end pt-6 border-t border-gray-200"
            >
              <Button
                variant="secondary"
                onClick={() => navigate(`/upload/${sessionId}`)}
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                loading={confirmJobMutation.isPending}
              >
                Confirm & Process
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobReviewPage;
