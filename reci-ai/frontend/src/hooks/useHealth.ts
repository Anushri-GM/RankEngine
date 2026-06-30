import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

export const useHealth = () => {
  return useQuery<HealthResponse, Error>({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiClient.get<HealthResponse>('/health');
      return response.data;
    },
    refetchInterval: 10000, // Poll health check status every 10s
    retry: 1,
  });
};
