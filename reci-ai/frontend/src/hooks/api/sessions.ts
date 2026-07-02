import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { HiringSession, ProcessingStatus } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Query hooks
export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleTitle: string) => {
      const response = await axios.post<{ data: HiringSession }>(
        `${API_BASE_URL}/api/v1/sessions`,
        { role_title: roleTitle }
      );
      return response.data.data;
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.setQueryData(['session', newSession.session_id], newSession);
    },
  });
};

export const useSession = (sessionId: string | undefined) => {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await axios.get<{ data: HiringSession }>(
        `${API_BASE_URL}/api/v1/sessions/${sessionId}`
      );
      return response.data.data;
    },
    enabled: !!sessionId,
    staleTime: 30000,
  });
};

export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await axios.get<{ data: HiringSession[] }>(
        `${API_BASE_URL}/api/v1/sessions`
      );
      return response.data.data;
    },
    staleTime: 60000,
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      await axios.delete(`${API_BASE_URL}/api/v1/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useSessionProcessingStatus = (sessionId: string | undefined) => {
  return useQuery({
    queryKey: ['session-processing', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await axios.get<{ data: ProcessingStatus }>(
        `${API_BASE_URL}/api/v1/sessions/${sessionId}/processing-status`
      );
      return response.data.data;
    },
    enabled: !!sessionId,
    refetchInterval: 1000, // Poll every second during processing
  });
};
