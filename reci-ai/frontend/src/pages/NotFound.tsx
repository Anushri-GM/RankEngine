import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, HelpCircle } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white border border-slate-100 rounded-2xl shadow-premium p-8">
        <div className="h-16 w-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
          <HelpCircle className="h-8 w-8 animate-bounce" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-700 mt-2">Page Not Found</h2>
        <p className="text-sm text-slate-400 mt-3 leading-relaxed">
          The requested address is not mapped inside the RECI navigation routing matrix. Please verify the URL or return home.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" onClick={() => navigate('/')} className="shadow-sm">
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};
