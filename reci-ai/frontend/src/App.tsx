import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Candidates } from './pages/Candidates';
import { Analytics } from './pages/Analytics';
import { Compare } from './pages/Compare';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { ParserDashboard } from './pages/ParserDashboard';

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Main SaaS Dashboard Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="compare" element={<Compare />} />
            <Route path="settings" element={<Settings />} />
            <Route path="parser" element={<ParserDashboard />} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
