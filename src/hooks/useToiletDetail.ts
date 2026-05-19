// 화장실 상세 훅 — React Query 활용
import { useQuery } from '@tanstack/react-query';
import { fetchToiletDetail, type ToiletResponse } from '../api/toilets';

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
    staleTime: 60_000, // 1분 캐시
  });

  return {
    toilet: data ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
