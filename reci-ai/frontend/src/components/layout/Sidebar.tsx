import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, GitCompare, Settings, X, Cpu } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Candidates', path: '/candidates', icon: Users },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Compare', path: '/compare', icon: GitCompare },
    { name: 'Parser', path: '/parser', icon: Cpu },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const activeStyle = 'bg-primary text-white shadow-md shadow-primary/20';
  const inactiveStyle = 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm md:hidden"
        />
      )}
      
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 md:translate-x-0 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 md:py-6">
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-wider bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">RECI</span>
            <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">Candidate Intel</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 md:hidden focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive ? activeStyle : inactiveStyle
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-800">Redrob Platform</p>
            <p className="text-[10px] text-slate-500 mt-1">Explainable AI Recruiter</p>
            <div className="mt-3 flex items-center justify-between text-[10px] font-semibold text-slate-400">
              <span>v1.0.0</span>
              <span className="h-2 w-2 rounded-full bg-success" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
