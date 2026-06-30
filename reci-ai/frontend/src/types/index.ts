export interface Candidate {
  id: string;
  name: string;
  role: string;
  experience: string;
  skills: string[];
  status: 'success' | 'warning' | 'info' | 'danger';
  statusLabel: string;
  score: number;
}
