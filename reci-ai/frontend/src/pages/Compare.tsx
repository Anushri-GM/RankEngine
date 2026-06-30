import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Users, Code, Award, CheckCircle } from 'lucide-react';

export const Compare: React.FC = () => {
  return (
    <PageContainer
      title="Compare Candidates"
      subtitle="Analyze and contrast suitability vectors side-by-side."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Candidate 1 */}
        <Card hoverEffect={true} className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8" />
          <div className="flex items-start space-x-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              SJ
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Sarah Jenkins</h3>
              <p className="text-xs text-slate-400">Senior Full Stack Engineer • 7 years exp</p>
              <div className="mt-2">
                <StatusBadge status="success" label="Match Score 94%" />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t border-slate-100 pt-4 text-sm">
            <div className="flex items-center space-x-2 text-slate-600">
              <Code className="h-4 w-4 text-primary" />
              <span className="font-semibold text-slate-700">Core Stack:</span>
              <span className="text-slate-500">React, Node.js, Python, Postgres</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Award className="h-4 w-4 text-primary" />
              <span className="font-semibold text-slate-700">Strength:</span>
              <span className="text-slate-500">System Architecture, React Performance</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="font-semibold text-slate-700">Interview Stage:</span>
              <span className="text-slate-500">Technical Stage Passed</span>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <Button variant="primary" className="flex-1">Schedule Review</Button>
            <Button variant="outline">Profile</Button>
          </div>
        </Card>

        {/* Candidate 2 */}
        <Card hoverEffect={true} className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8" />
          <div className="flex items-start space-x-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
              DK
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">David Kojo</h3>
              <p className="text-xs text-slate-400">AI Infrastructure Architect • 9 years exp</p>
              <div className="mt-2">
                <StatusBadge status="success" label="Match Score 88%" />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t border-slate-100 pt-4 text-sm">
            <div className="flex items-center space-x-2 text-slate-600">
              <Code className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-slate-700">Core Stack:</span>
              <span className="text-slate-500">Python, PyTorch, Kubernetes, AWS</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Award className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-slate-700">Strength:</span>
              <span className="text-slate-500">Large Model Scaling, CUDA Optimization</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-slate-700">Interview Stage:</span>
              <span className="text-slate-500">System Design Scheduled</span>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <Button variant="primary" className="flex-1 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500">Schedule Review</Button>
            <Button variant="outline">Profile</Button>
          </div>
        </Card>
      </div>

      {/* Comparison table */}
      <Card className="mt-8">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center">
          <Users className="h-4 w-4 mr-2 text-slate-400" />
          Technical Fit Vectors
        </h3>
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-3 font-semibold text-slate-400 border-b border-slate-50 pb-2">
            <div>Vector Dimension</div>
            <div>Sarah Jenkins</div>
            <div>David Kojo</div>
          </div>
          <div className="grid grid-cols-3 border-b border-slate-50 py-2.5">
            <div className="font-medium text-slate-600">Frontend Competence</div>
            <div className="text-slate-800 font-semibold">9.5 / 10</div>
            <div className="text-slate-500">4.5 / 10</div>
          </div>
          <div className="grid grid-cols-3 border-b border-slate-50 py-2.5">
            <div className="font-medium text-slate-600">Backend Competence</div>
            <div className="text-slate-800 font-semibold">8.5 / 10</div>
            <div className="text-slate-800 font-semibold">9.0 / 10</div>
          </div>
          <div className="grid grid-cols-3 border-b border-slate-50 py-2.5">
            <div className="font-medium text-slate-600">AI / Infrastructure</div>
            <div className="text-slate-500">3.0 / 10</div>
            <div className="text-slate-800 font-semibold">9.8 / 10</div>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};
