import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common';
import { Home, HelpCircle } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white border border-gray-200 rounded-lg shadow-lg p-8">
        <div className="h-16 w-16 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center text-red-500 mx-auto mb-6">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <h2 className="text-lg font-semibold text-gray-700 mt-2">Page Not Found</h2>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
          The page you're looking for doesn't exist. Please verify the URL or return home.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/')} className="flex items-center gap-2 justify-center">
            <Home size={20} />
            Back to Home
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

