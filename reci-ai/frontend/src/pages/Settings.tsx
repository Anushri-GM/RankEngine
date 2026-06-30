import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Shield, Server, Database } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <PageContainer
      title="Settings"
      subtitle="Configure system environments and intelligence parameters."
    >
      <div className="space-y-6">
        {/* Platform Config */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <Server className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-slate-800">API Connection Configuration</h3>
          </div>
          <div className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Backend V1 API Endpoint</label>
              <input
                type="text"
                disabled
                value={import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-mono"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Loaded dynamically from frontend VITE_API_URL environment configuration.
              </p>
            </div>
          </div>
        </Card>

        {/* Cache Config */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-slate-800">Intelligence Cache Parameters</h3>
          </div>
          <div className="space-y-4 max-w-xl text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Embedding Cache Path</label>
                <input
                  type="text"
                  disabled
                  value="/app/cache"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Output Directories</label>
                <input
                  type="text"
                  disabled
                  value="/app/outputs"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Determined by backend config.py using MODEL_CACHE and OUTPUT_PATH keys.
            </p>
          </div>
        </Card>

        {/* Security Parameters */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-slate-800">Explainable Privacy Settings</h3>
          </div>
          <div className="space-y-4 max-w-xl text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div>
                <p className="font-semibold text-slate-700">Anonymize Candidate PII</p>
                <p className="text-[10px] text-slate-400">Mask names and contact details during AI vector mapping.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-primary rounded border-slate-300 focus:ring-primary" />
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <div>
                <p className="font-semibold text-slate-700">Detailed Explanations</p>
                <p className="text-[10px] text-slate-400">Generate structured natural language justifications for scores.</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-primary rounded border-slate-300 focus:ring-primary" />
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button variant="outline">Reset to Defaults</Button>
          <Button variant="primary">Save Configuration</Button>
        </div>
      </div>
    </PageContainer>
  );
};
