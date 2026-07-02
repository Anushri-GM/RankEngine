import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import type { JobUnderstanding, ApiResponse } from '../../types';

export const useUploadJobDescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { session_id: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('session_id', data.session_id);

      const response = await apiClient.post<ApiResponse<any>>(
        `/uploads/job-description`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session', variables.session_id] });
      queryClient.invalidateQueries({ queryKey: ['job-understanding', variables.session_id] });
    },
  });
};

export const useUploadCandidateDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { session_id: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('session_id', data.session_id);

      const response = await apiClient.post<ApiResponse<any>>(
        `/uploads/candidate-dataset`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session', variables.session_id] });
    },
  });
};

export const useJobUnderstanding = (sessionId: string | undefined) => {
  return useQuery({
    queryKey: ['job-understanding', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await apiClient.get<{ data: JobUnderstanding }>(
        `/jobs/${sessionId}`
      );
      return response.data.data;
    },
    enabled: !!sessionId,
    staleTime: 300000,
  });
};

export const useUpdateJobUnderstanding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { session_id: string; job: JobUnderstanding }) => {
      const response = await apiClient.put<{ data: JobUnderstanding }>(
        `/jobs/${data.session_id}`,
        data.job
      );
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(['job-understanding', variables.session_id], variables.job);
      queryClient.invalidateQueries({ queryKey: ['session', variables.session_id] });
    },
  });
};

export const useConfirmJobUnderstanding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiClient.post<ApiResponse<any>>(
        `/jobs/${sessionId}/confirm`
      );
      return response.data;
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
    },
  });
};
