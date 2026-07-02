import React from 'react';
import { Menu, User, Bell } from 'lucide-react';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-morphism border-b border-slate-200 flex items-center justify-between px-6 py-4">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 md:hidden focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-xl tracking-wider text-slate-900">RECI</span>
          <span className="hidden md:inline-block px-2 py-0.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded border border-slate-200">AI Platform</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative focus:outline-none">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger" />
        </button>
        
        <div className="h-8 w-px bg-slate-200" />
        
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 group-hover:bg-slate-200 transition-colors">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-none">Recruiter</p>
            <p className="text-[10px] text-slate-600 mt-0.5 leading-none">recruiter@demo.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};
