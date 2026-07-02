import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import type { HiringSession, ProcessingStatus } from '../../types';

// Query hooks
export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleTitle: string) => {
      const response = await apiClient.post<{ data: HiringSession }>(
        `/sessions`,
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
      const response = await apiClient.get<{ data: HiringSession }>(
        `/sessions/${sessionId}`
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
      const response = await apiClient.get<{ data: HiringSession[] }>(
        `/sessions`
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
      await apiClient.delete(`/sessions/${sessionId}`);
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
      const response = await apiClient.get<{ data: ProcessingStatus }>(
        `/sessions/${sessionId}/processing-status`
      );
      return response.data.data;
    },
    enabled: !!sessionId,
    refetchInterval: 1000, // Poll every second during processing
  });
};
