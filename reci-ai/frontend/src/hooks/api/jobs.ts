import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { JobUnderstanding, ApiResponse } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useUploadJobDescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { session_id: string; file: File }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('session_id', data.session_id);

      const response = await axios.post<ApiResponse<any>>(
        `${API_BASE_URL}/api/v1/uploads/job-description`,
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

      const response = await axios.post<ApiResponse<any>>(
        `${API_BASE_URL}/api/v1/uploads/candidate-dataset`,
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
      const response = await axios.get<{ data: JobUnderstanding }>(
        `${API_BASE_URL}/api/v1/jobs/${sessionId}`
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
      const response = await axios.put<{ data: JobUnderstanding }>(
        `${API_BASE_URL}/api/v1/jobs/${data.session_id}`,
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
      const response = await axios.post<ApiResponse<any>>(
        `${API_BASE_URL}/api/v1/jobs/${sessionId}/confirm`
      );
      return response.data;
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
    },
  });
};
