import React from 'react';
import { Menu, User, Bell } from 'lucide-react';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-morphism border-b border-slate-100 flex items-center justify-between px-6 py-4">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 md:hidden focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">RECI</span>
          <span className="hidden md:inline-block px-2 py-0.5 text-xs font-semibold text-primary bg-blue-50 rounded border border-blue-100">AI Platform</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 relative focus:outline-none">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger" />
        </button>
        
        <div className="h-8 w-px bg-slate-200" />
        
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">Admin User</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-none">admin@redrob.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};
