import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useJobUnderstanding, useUpdateJobUnderstanding, useConfirmJobUnderstanding } from '../../hooks/api/jobs';
import { Card, Button, Spinner } from '../../components/common';
import { SkillChip } from '../../components/panels/ScorePanel';
import { Edit2 } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!jobUnderstanding) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-sm">
          <p className="text-slate-600 mb-4">Job description not found. Please upload it first.</p>
          <Button onClick={() => navigate(`/upload/${sessionId}`)}>
            Go to Upload
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ letterSpacing: '-0.025em' }}>
              Review Job Understanding
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review the AI's understanding of the job before proceeding to ranking.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <Edit2 size={16} />
            {isEditing ? 'Done Editing' : 'Edit'}
          </Button>
        </div>
      </motion.div>

      {/* Role Title */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Role Title</h2>
          {isEditing ? (
            <input
              type="text"
              value={editedJob?.role_title || ''}
              onChange={(e) =>
                setEditedJob(editedJob ? { ...editedJob, role_title: e.target.value } : undefined)
              }
              className="reci-input"
            />
          ) : (
            <p className="text-lg font-semibold text-slate-900">{jobUnderstanding.role_title}</p>
          )}
        </Card>
      </motion.div>

      {/* Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 h-full">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <CheckCircle size={15} className="text-red-500" />
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {jobUnderstanding.required_skills.map((skill) => (
                <SkillChip key={skill.name} skill={skill.name} proficiency={skill.proficiency} />
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5 h-full">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Preferred Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {jobUnderstanding.preferred_skills.map((skill) => (
                <SkillChip key={skill.name} skill={skill.name} proficiency={skill.proficiency} />
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Key Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Key Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {jobUnderstanding.experience_required && (
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Experience</p>
                <p className="text-sm font-semibold text-slate-800">{jobUnderstanding.experience_required}</p>
              </div>
            )}
            {jobUnderstanding.industry && (
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Industry</p>
                <p className="text-sm font-semibold text-slate-800">{jobUnderstanding.industry}</p>
              </div>
            )}
            {jobUnderstanding.education_requirement && (
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Education</p>
                <p className="text-sm font-semibold text-slate-800">{jobUnderstanding.education_requirement}</p>
              </div>
            )}
            {jobUnderstanding.location && (
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Location</p>
                <p className="text-sm font-semibold text-slate-800">{jobUnderstanding.location}</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Responsibilities */}
      {jobUnderstanding.responsibilities && jobUnderstanding.responsibilities.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Responsibilities</h3>
            <ul className="space-y-2">
              {jobUnderstanding.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex gap-2.5 text-sm text-slate-700">
                  <span className="text-indigo-500 font-bold mt-0.5 flex-shrink-0">•</span>
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 justify-end pt-2 border-t border-slate-100"
        >
          <Button
            variant="secondary"
            onClick={() => { setIsEditing(false); setEditedJob(jobUnderstanding); }}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveEdits} loading={updateJobMutation.isPending}>
            Save Changes
          </Button>
        </motion.div>
      )}

      {/* Proceed Actions */}
      {!isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 justify-end pt-2 border-t border-slate-100"
        >
          <Button variant="secondary" onClick={() => navigate(`/upload/${sessionId}`)}>
            ← Back
          </Button>
          <Button onClick={handleConfirm} loading={confirmJobMutation.isPending}>
            Confirm & Process →
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default JobReviewPage;
