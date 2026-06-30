import React from 'react';
import { motion } from 'framer-motion';

interface PageContainerProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  action,
  children,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6 max-w-7xl mx-auto p-4 md:p-8"
    >
      {(title || subtitle || action) && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            {title && <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{title}</h1>}
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center space-x-3">{action}</div>}
        </div>
      )}
      <div className="w-full">
        {children}
      </div>
    </motion.div>
  );
};
