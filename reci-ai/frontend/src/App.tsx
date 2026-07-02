import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import HomePage from './pages/Home/Home';
import UploadPage from './pages/Upload/Upload';
import JobReviewPage from './pages/JobReview/JobReview';
import ProcessingPage from './pages/Processing/Processing';
import WorkspacePage from './pages/Workspace/Workspace';
import CandidateDetailPage from './pages/CandidateDetail/CandidateDetail';
import ComparePage from './pages/Compare/Compare';
import InsightsPage from './pages/Insights/Insights';
import { NotFound } from './pages/NotFound';

// Layout
import { Layout } from './components/layout/Layout';

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 60000,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Main Application Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/upload/:sessionId" element={<UploadPage />} />
          <Route path="/job-review/:sessionId" element={<JobReviewPage />} />
          <Route path="/processing/:sessionId" element={<ProcessingPage />} />
          <Route path="/workspace/:sessionId" element={<WorkspacePage />} />
          <Route path="/candidate/:sessionId/:candidateId" element={<CandidateDetailPage />} />
          <Route path="/compare/:sessionId/:candidateId1/:candidateId2" element={<ComparePage />} />
          <Route path="/insights/:sessionId" element={<InsightsPage />} />

          {/* Legacy Routes - Redirect to home */}
          <Route path="/parser" element={<HomePage />} />
          <Route path="/candidates" element={<HomePage />} />
          <Route path="/analytics" element={<HomePage />} />
          <Route path="/settings" element={<HomePage />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
