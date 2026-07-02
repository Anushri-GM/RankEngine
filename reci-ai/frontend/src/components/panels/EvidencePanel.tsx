import React from 'react';
import { motion } from 'framer-motion';
import type { Evidence, DecisionStep } from '../../types';
import { formatDuration } from '../../utils/formatters';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface EvidencePanelProps {
  evidence?: Evidence[];
  className?: string;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ evidence = [], className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">Evidence</h3>

      {evidence.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p>No evidence available</p>
        </div>
      ) : (
        evidence.map((section, sectionIdx) => (
          <motion.div
            key={sectionIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIdx * 0.1 }}
            className="border border-gray-200 rounded-lg p-4"
          >
            <h4 className="font-semibold text-slate-900 mb-3">{section.category}</h4>

            <div className="space-y-3">
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex gap-3 pb-3 border-b border-gray-100 last:pb-0 last:border-0">
                  <div className="flex-shrink-0">
                    {item.verified ? (
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle size={16} className="text-green-600" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <AlertCircle size={16} className="text-gray-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{item.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-xs font-medium text-gray-700 rounded">
                        {item.source}
                      </span>
                      {item.verified && (
                        <span className="inline-block px-2 py-1 bg-green-100 text-xs font-medium text-green-700 rounded">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

interface DecisionTimelineProps {
  steps: DecisionStep[];
  className?: string;
}

export const DecisionTimeline: React.FC<DecisionTimelineProps> = ({ steps, className = '' }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'processing':
        return <Clock size={20} className="text-blue-600 animate-spin" />;
      case 'pending':
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'processing':
        return 'bg-blue-50 border-blue-200';
      case 'pending':
        return 'bg-gray-50 border-gray-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">Decision Timeline</h3>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex gap-4 p-4 border rounded-lg ${getStatusColor(step.status)}`}
          >
            <div className="flex-shrink-0 mt-1">{getStatusIcon(step.status)}</div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">{step.step_name}</h4>
                {step.duration_ms !== undefined && (
                  <span className="text-sm text-gray-600">
                    {formatDuration(step.duration_ms)}
                  </span>
                )}
              </div>

              {step.details && (
                <p className="text-sm text-slate-700 mt-1">{step.details}</p>
              )}

              {step.output_count !== undefined && (
                <p className="text-xs text-slate-600 mt-2">
                  Output: {step.output_count} items
                </p>
              )}

              <div className="text-xs text-slate-500 mt-2 capitalize">
                {step.status}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {steps.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Total Processing Time:</span>{' '}
            {formatDuration(
              steps.reduce((sum, step) => sum + (step.duration_ms || 0), 0)
            )}
          </p>
        </div>
      )}
    </div>
  );
};

interface ProcessingProgressProps {
  currentStep: string;
  progress: number;
  totalSteps: number;
  completedSteps: number;
  estimatedTimeRemaining?: number;
  className?: string;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  currentStep,
  progress,
  totalSteps,
  completedSteps,
  estimatedTimeRemaining,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing...</h3>
        <p className="text-sm text-gray-600 mb-4">{currentStep}</p>

        {/* Main Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Step {completedSteps + 1} of {totalSteps}
            </span>
            <span className="font-semibold text-gray-900">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700">Processing Pipeline</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-2 rounded-lg text-center text-xs font-medium transition-all ${
                idx < completedSteps
                  ? 'bg-green-100 text-green-800'
                  : idx === completedSteps
                    ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-400'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              Step {idx + 1}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Estimated Time */}
      {estimatedTimeRemaining !== undefined && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Estimated time remaining:</span>{' '}
            {estimatedTimeRemaining > 0
              ? formatDuration(estimatedTimeRemaining)
              : 'Almost done...'}
          </p>
        </div>
      )}
    </div>
  );
};
