import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Cpu,
  Sparkles,
  X,
  CircleDot,
  Info,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard, exact: true },
  { label: 'Demo', path: '/demo', icon: Sparkles },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path) && path !== '/';
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`app-sidebar transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="sidebar-logo flex items-center justify-between">
          <div>
            <div className="sidebar-logo-mark">RECI</div>
            <div className="sidebar-logo-sub">Explainable AI · Redrob</div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Workspace</div>

          {navItems.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`sidebar-item ${active ? 'active' : ''}`}
              >
                <item.icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="sidebar-section-label mt-4">Intelligence</div>

          <div className="sidebar-item" style={{ opacity: 0.45, cursor: 'default' }}>
            <Cpu />
            <span>Analysis Engine</span>
            <span className="ml-auto text-[9px] font-semibold tracking-widest uppercase bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded">Soon</span>
          </div>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-card">
            <div className="flex items-center gap-2 mb-2">
              <CircleDot size={10} className="text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">System Online</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              AI Ranking Engine · v1.0
            </p>
            <div className="flex items-center gap-1.5 mt-2.5">
              <Info size={10} className="text-indigo-400 flex-shrink-0" />
              <p className="text-[10px] text-slate-500">Redrob Hackathon Build</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
