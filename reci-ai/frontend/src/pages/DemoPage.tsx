import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/common';
import { PlayCircle } from 'lucide-react';
import { apiClient } from '../api/client';

export const DemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleDemo = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/system/demo');
      navigate(`/workspace/${response.data.session_id}`);
    } catch (error) {
      console.error(error);
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
        </Card>
      </div>
    </div>
  );
};

export default DemoPage;
