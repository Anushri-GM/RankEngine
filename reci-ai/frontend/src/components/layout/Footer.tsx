import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-100 py-6 px-8 text-center md:flex md:items-center md:justify-between text-xs text-slate-600">
      <p>© {new Date().getFullYear()} RECI (Redrob Explainable Candidate Intelligence). All rights reserved.</p>
      <div className="flex justify-center space-x-6 mt-2 md:mt-0">
        <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-slate-600 transition-colors">Support</a>
      </div>
    </footer>
  );
};
