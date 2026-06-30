import React from 'react';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'danger' | 'info';
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
}) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
          status === 'success'
            ? 'bg-emerald-500'
            : status === 'warning'
            ? 'bg-amber-500'
            : status === 'danger'
            ? 'bg-rose-500'
            : 'bg-blue-500'
        }`}
      />
      {label}
    </span>
  );
};
