import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullPage?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  label,
  fullPage = false,
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-[3px]',
    lg: 'h-16 w-16 border-4',
  };

  const containerClasses = fullPage
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 bg-opacity-70 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div
        className={`animate-spin rounded-full border-t-primary border-r-transparent border-b-primary border-l-transparent ${sizeClasses[size]}`}
      />
      {label && <p className="mt-3 text-sm font-medium text-slate-500 animate-pulse">{label}</p>}
    </div>
  );
};
