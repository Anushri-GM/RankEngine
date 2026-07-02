import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { RecruitingInsights, ExportOptions } from '../../types';

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
      const isPdf = data.options.format === 'pdf';
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/export/${data.session_id}`,
        data.options,
        {
          responseType: isPdf ? 'blob' : 'json',
        }
      );

      let blob: Blob;
      const filename = `ranking_results_${data.session_id}.${data.options.format}`;

      if (isPdf) {
        blob = response.data;
      } else {
        const payload = response.data.data;
        const rawContent = payload.data_raw || JSON.stringify(payload, null, 2);
        const mimeType = data.options.format === 'json' ? 'application/json' : 'text/csv';
        blob = new Blob([rawContent], { type: mimeType });
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    },
  });
};
