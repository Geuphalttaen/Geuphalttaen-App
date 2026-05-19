// 화장실 상세 훅 — React Query 활용
import { useQuery } from '@tanstack/react-query';
import { fetchToiletDetail, type ToiletResponse } from '@/src/features/toilets/api';

interface UseToiletDetailResult {
  toilet: ToiletResponse | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useToiletDetail(id: number): UseToiletDetailResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['toilets', 'detail', id],
    queryFn: () => fetchToiletDetail(id),
    staleTime: 60_000,
  });

  return {
    toilet: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
