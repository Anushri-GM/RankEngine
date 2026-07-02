import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Bell } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/demo': 'Demo',
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/workspace/')) return 'Candidate Workspace';
  if (pathname.startsWith('/upload/')) return 'Upload Files';
  if (pathname.startsWith('/job-review/')) return 'Job Review';
  if (pathname.startsWith('/processing/')) return 'Processing';
  if (pathname.startsWith('/candidate/')) return 'Candidate Profile';
  if (pathname.startsWith('/compare/')) return 'Compare Candidates';
  if (pathname.startsWith('/insights/')) return 'Session Insights';
  return 'RECI';
}

export const AppLayout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-main">
        {/* Topbar */}
        <header className="app-topbar">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden mr-3 p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-700 tracking-tight">{pageTitle}</h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
              <Bell size={16} />
            </button>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
              R
            </div>
          </div>
        </header>

        {/* Page content */}
        <motion.main
          className="app-content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          key={location.pathname}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default AppLayout;
