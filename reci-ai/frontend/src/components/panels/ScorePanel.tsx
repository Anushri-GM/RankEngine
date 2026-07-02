import React from 'react';
import { motion } from 'framer-motion';
import { FitScoreBreakdown, FitComponent } from '../../types';
import { formatScore } from '../../utils/formatters';
import { ChevronDown } from 'lucide-react';

interface FitScoreProps {
  score: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const FitScore: React.FC<FitScoreProps> = ({
  score,
  max = 100,
  label,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const percentage = (score / max) * 100;
  const getColor = (pct: number) => {
    if (pct >= 80) return '#10b981'; // green
    if (pct >= 60) return '#f59e0b'; // amber
    if (pct >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        <svg className="absolute" width="100%" height="100%" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getColor(percentage)}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: `${2 * Math.PI * 45}` }}
            animate={{ strokeDashoffset: `${2 * Math.PI * 45 * (1 - percentage / 100)}` }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        <div className="text-center">
          <div className={`${textSizeClasses[size]} font-bold text-gray-900`}>{formatScore(score)}</div>
          {label && <div className="text-xs text-gray-600 mt-1">{label}</div>}
        </div>
      </div>
      {showLabel && <div className="text-sm text-gray-600 mt-2 font-medium">{percentage.toFixed(0)}%</div>}
    </div>
  );
};

interface ScoreBreakdownProps {
  breakdown: FitScoreBreakdown;
  className?: string;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ breakdown, className = '' }) => {
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);

  const sections = [
    { key: 'technical_fit', label: 'Technical Fit', color: 'text-blue-600' },
    { key: 'career_fit', label: 'Career Fit', color: 'text-purple-600' },
    { key: 'behavior_fit', label: 'Behavior Fit', color: 'text-green-600' },
    { key: 'experience_fit', label: 'Experience Fit', color: 'text-yellow-600' },
    { key: 'domain_fit', label: 'Domain Fit', color: 'text-red-600' },
    { key: 'trust_score', label: 'Trust Score', color: 'text-pink-600' },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      {sections.map(({ key, label, color }) => {
        const component = breakdown[key as keyof FitScoreBreakdown];
        const isExpanded = expandedSection === key;

        return (
          <motion.div
            key={key}
            className="border border-gray-200 rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setExpandedSection(isExpanded ? null : key)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 text-left">
                  <h4 className={`font-semibold ${color} mb-1`}>{label}</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                      <div
                        className={`h-full rounded-full transition-all ${color.replace('text', 'bg')}`}
                        style={{ width: `${component.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatScore(component.score)}/{component.max_score}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronDown
                size={20}
                className={`text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 bg-gray-50 p-4"
              >
                {component.explanation && (
                  <p className="text-sm text-gray-700 mb-4">{component.explanation}</p>
                )}

                <div className="space-y-2">
                  <h5 className="text-sm font-semibold text-gray-900 mb-3">Contributing Factors</h5>
                  {component.factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-white rounded border border-gray-100"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{factor.name}</p>
                        {factor.description && (
                          <p className="text-xs text-gray-600">{factor.description}</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        +{formatScore(factor.contribution)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

interface SkillChipProps {
  skill: string;
  proficiency?: 'beginner' | 'intermediate' | 'expert';
  verified?: boolean;
  onRemove?: () => void;
  className?: string;
}

export const SkillChip: React.FC<SkillChipProps> = ({
  skill,
  proficiency,
  verified = false,
  onRemove,
  className = '',
}) => {
  const proficiencyColors = {
    beginner: 'bg-gray-100 text-gray-800',
    intermediate: 'bg-blue-100 text-blue-800',
    expert: 'bg-green-100 text-green-800',
  };

  const color = proficiency ? proficiencyColors[proficiency] : 'bg-gray-100 text-gray-800';

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${color} ${className}`}
    >
      <span>{skill}</span>
      {proficiency && <span className="text-xs opacity-75">{proficiency}</span>}
      {verified && <span className="text-xs font-bold">✓</span>}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-70"
        >
          ×
        </button>
      )}
    </div>
  );
};
