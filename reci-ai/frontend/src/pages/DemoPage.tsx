import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/common';
import { PlayCircle } from 'lucide-react';
import { apiClient } from '../api/client';

export const DemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/system/demo');
      navigate(`/workspace/${response.data.session_id}`);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || 
        'Could not connect to the backend server. Please verify that the backend is running on http://localhost:8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-slate-900">RECI Demo Mode</h1>
          <p className="text-slate-600 mt-3">Launch a sample hiring session without any manual setup.</p>
          <Button onClick={handleDemo} loading={loading} className="mt-6 flex items-center gap-2" aria-label="Start demo mode">
            <PlayCircle size={18} />
            Start Demo
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 mt-4">
              <p className="font-semibold flex items-center gap-2">
                <span>⚠️</span> Connection Error
              </p>
              <p className="text-xs mt-1 text-red-700">{error}</p>
              <p className="text-xs mt-2 text-slate-500 font-medium">
                Tip: Run <code className="bg-slate-100 px-1.5 py-0.5 rounded">start_backend.bat</code> in the repository root to start the backend server.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DemoPage;
