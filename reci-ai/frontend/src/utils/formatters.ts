/**
 * Formatting utilities
 */

export const formatScore = (score: number, decimals = 1): string => {
  return (Math.round(score * Math.pow(10, decimals)) / Math.pow(10, decimals)).toFixed(decimals);
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

export const formatExperience = (years: number): string => {
  if (years < 1) {
    const months = Math.round(years * 12);
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  if (years === 1) {
    return '1 year';
  }
  return `${years} years`;
};

/**
 * Score-related utilities
 */

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

export const getScoreBgColor = (score: number): string => {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  if (score >= 40) return 'bg-orange-100';
  return 'bg-red-100';
};

export const getScoreBadgeColor = (score: number): 'success' | 'warning' | 'info' | 'danger' => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  if (score >= 40) return 'info';
  return 'danger';
};

export const getRecommendationLabel = (recommendation: string): string => {
  const labels: Record<string, string> = {
    strong_match: 'Strong Match',
    good_match: 'Good Match',
    potential_match: 'Potential Match',
    weak_match: 'Weak Match',
  };
  return labels[recommendation] || recommendation;
};

export const getRecommendationColor = (recommendation: string): string => {
  const colors: Record<string, string> = {
    strong_match: 'bg-green-100 text-green-800',
    good_match: 'bg-blue-100 text-blue-800',
    potential_match: 'bg-yellow-100 text-yellow-800',
    weak_match: 'bg-red-100 text-red-800',
  };
  return colors[recommendation] || 'bg-gray-100 text-gray-800';
};

export const getTrustScoreLabel = (score: number): string => {
  if (score >= 75) return 'High Trust';
  if (score >= 60) return 'Good Trust';
  if (score >= 40) return 'Moderate Trust';
  return 'Low Trust';
};

export const getProficiencyColor = (proficiency: string): string => {
  const colors: Record<string, string> = {
    expert: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    beginner: 'bg-gray-100 text-gray-800',
  };
  return colors[proficiency] || 'bg-gray-100 text-gray-800';
};

/**
 * Array and object utilities
 */

export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
};

export const calculateMedian = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const calculateStdDev = (numbers: number[]): number => {
  const avg = calculateAverage(numbers);
  const squareDiffs = numbers.map((num) => Math.pow(num - avg, 2));
  return Math.sqrt(calculateAverage(squareDiffs));
};

/**
 * Validation utilities
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidFileSize = (file: File, maxSizeMB: number): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * String utilities
 */

export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toTitleCase = (str: string): string => {
  return str
    .split(' ')
    .map((word) => capitalize(word.toLowerCase()))
    .join(' ');
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * ID/Key utilities
 */

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateSessionId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `SESSION_${timestamp}_${random}`.toUpperCase();
};

/**
 * Export utilities
 */

export const downloadJson = (data: any, filename: string): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadBlob(blob, filename);
};

export const downloadCsv = (data: any[], filename: string): void => {
  const headers = Object.keys(data[0]);
  const rows = data.map((obj) =>
    headers.map((header) => {
      const value = obj[header];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value;
    })
  );

  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  downloadBlob(blob, filename);
};

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Comparison utilities
 */

export const compareScores = (score1: number, score2: number): 'tie' | 'higher' | 'lower' => {
  const diff = Math.abs(score1 - score2);
  if (diff < 1) return 'tie';
  return score1 > score2 ? 'higher' : 'lower';
};

export const calculateScoreDifference = (score1: number, score2: number): number => {
  return Math.round((score1 - score2) * 10) / 10;
};
