import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { RecruitingInsights, ExportOptions, ExportResult } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useInsights = (sessionId: string | undefined) => {
  return useQuery({
    queryKey: ['insights', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await axios.get<{ data: RecruitingInsights }>(
        `${API_BASE_URL}/api/v1/insights/${sessionId}`
      );
      return response.data.data;
    },
    enabled: !!sessionId,
    staleTime: 300000,
  });
};

export const useExportResults = () => {
  return useMutation({
    mutationFn: async (data: { session_id: string; options: ExportOptions }) => {
      const response = await axios.post<{ data: ExportResult }>(
        `${API_BASE_URL}/api/v1/export/${data.session_id}`,
        data.options,
        {
          responseType: data.options.format === 'pdf' ? 'blob' : 'json',
        }
      );

      if (data.options.format === 'pdf') {
        // Handle PDF blob
        const url = window.URL.createObjectURL(response.data as any);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ranking_results_${data.session_id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        return { success: true };
      }

      return response.data.data;
    },
  });
};
