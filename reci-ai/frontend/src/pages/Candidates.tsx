import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Search, UserPlus, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  role: string;
  experience: string;
  skills: string[];
  status: 'success' | 'warning' | 'info' | 'danger';
  statusLabel: string;
  score: number;
}

export const Candidates: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const mockCandidates: Candidate[] = [
    {
      id: 'c-1',
      name: 'Sarah Jenkins',
      role: 'Senior Full Stack Engineer',
      experience: '7 years',
      skills: ['React', 'Node.js', 'Python', 'PostgreSQL'],
      status: 'success',
      statusLabel: 'Matched',
      score: 94,
    },
    {
      id: 'c-2',
      name: 'David Kojo',
      role: 'AI Infrastructure Architect',
      experience: '9 years',
      skills: ['Python', 'PyTorch', 'Docker', 'Kubernetes', 'AWS'],
      status: 'success',
      statusLabel: 'Matched',
      score: 88,
    },
    {
      id: 'c-3',
      name: 'Elena Rostova',
      role: 'Product Manager (Technical)',
      experience: '5 years',
      skills: ['Product Roadmapping', 'SQL', 'Agile', 'Jira'],
      status: 'info',
      statusLabel: 'Under Review',
      score: 76,
    },
    {
      id: 'c-4',
      name: 'Marcus Vance',
      role: 'Frontend Developer',
      experience: '3 years',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
      status: 'warning',
      statusLabel: 'Screening',
      score: 65,
    }
  ];

  const filteredCandidates = mockCandidates.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PageContainer
      title="Candidates"
      subtitle="View, search, and manage parsed candidate profiles."
      action={
        <Button variant="primary" className="shadow-sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      }
    >
      {/* Search & Filter Bar */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, role, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <Button variant="outline" size="sm" className="w-full md:w-auto">
              <SlidersHorizontal className="h-4 w-4 mr-2 text-slate-600" />
              Filters
            </Button>
            <Button variant="outline" size="sm" className="w-full md:w-auto">
              <ArrowUpDown className="h-4 w-4 mr-2 text-slate-600" />
              Sort
            </Button>
          </div>
        </div>
      </Card>

      {/* Candidate List Table */}
      <Card className="p-0 overflow-hidden">
        {filteredCandidates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Name / Experience</th>
                  <th className="px-6 py-4">Target Role</th>
                  <th className="px-6 py-4">Skills</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Match Score</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{c.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{c.experience} exp</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{c.role}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {c.skills.map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200/50">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} label={c.statusLabel} />
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs ${
                        c.score >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        c.score >= 75 ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {c.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" className="h-8">
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-sm font-semibold text-slate-600">No candidates match your query.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting your search query or filters.</p>
          </div>
        )}
      </Card>
    </PageContainer>
  );
};
