import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import type { CandidateProfile, CandidateDetail, RankingResult, SearchFilters, SearchResult } from '../../types';

export const useCandidates = (sessionId: string | undefined) => {
  return useQuery({
    queryKey: ['candidates', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await apiClient.get<{ data: CandidateProfile[] }>(
        `/candidates/${sessionId}`
      );
      return response.data.data;
    },
    enabled: !!sessionId,
    staleTime: 120000,
  });
};

export const useCandidateDetail = (sessionId: string | undefined, candidateId: string | undefined) => {
  return useQuery({
    queryKey: ['candidate-detail', sessionId, candidateId],
    queryFn: async () => {
      if (!sessionId || !candidateId) throw new Error('Session ID and Candidate ID are required');
      const response = await apiClient.get<{ data: CandidateDetail }>(
        `/candidates/${sessionId}/${candidateId}`
      );
      return response.data.data;
    },
    enabled: !!sessionId && !!candidateId,
    staleTime: 300000,
  });
};

export const useSearchCandidates = (sessionId: string | undefined, filters: SearchFilters) => {
  return useQuery({
    queryKey: ['candidates-search', sessionId, JSON.stringify(filters)],
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID is required');
      const response = await apiClient.get<{ data: SearchResult }>(
        `/candidates/${sessionId}/search`,
        { params: filters }
      );
      return response.data.data;
    },
    enabled: !!sessionId,
  });
};

export const useRankCandidates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiClient.post<{ data: RankingResult }>(
        `/ranking/${sessionId}`,
        {}
      );
      return response.data.data;
    },
    onSuccess: (data, sessionId) => {
      queryClient.setQueryData(['candidates', sessionId], data.candidates);
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
    },
  });
};

export const useCompareCandidates = (sessionId: string | undefined, candidateId1: string | undefined, candidateId2: string | undefined) => {
  return useQuery({
    queryKey: ['compare-candidates', sessionId, candidateId1, candidateId2],
    queryFn: async () => {
      if (!sessionId || !candidateId1 || !candidateId2) {
        throw new Error('Session ID and both Candidate IDs are required');
      }
      const response = await apiClient.get<{ data: any }>(
        `/candidates/${sessionId}/compare`,
        {
          params: { candidate1_id: candidateId1, candidate2_id: candidateId2 },
        }
      );
      return response.data.data;
    },
    enabled: !!sessionId && !!candidateId1 && !!candidateId2,
  });
};

export const useFitScoreBreakdown = (sessionId: string | undefined, candidateId: string | undefined) => {
  return useQuery({
    queryKey: ['fit-score-breakdown', sessionId, candidateId],
    queryFn: async () => {
      if (!sessionId || !candidateId) throw new Error('Session ID and Candidate ID are required');
      const response = await apiClient.get<{ data: any }>(
        `/candidates/${sessionId}/${candidateId}/fit-breakdown`
      );
      return response.data.data;
    },
    enabled: !!sessionId && !!candidateId,
  });
};
