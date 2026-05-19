// 근처 화장실 목록 훅 — React Query 활용
import { useQuery } from '@tanstack/react-query';
import { fetchNearbyToilets, type ToiletResponse } from '@/src/features/toilets/api';

interface UseNearbyToiletsParams {
  lat: number | null;
  lng: number | null;
  radiusMeters?: number;
}

interface UseNearbyToiletsResult {
  toilets: ToiletResponse[];
  isLoading: boolean;
  // I1: TanStack Query v5에서 error는 Error | null 타입으로 정확히 추론됨
  error: Error | null;
  refetch: () => void;
}

export function useNearbyToilets({
  lat,
  lng,
  radiusMeters = 500,
}: UseNearbyToiletsParams): UseNearbyToiletsResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['toilets', 'nearby', lat, lng, radiusMeters],
    queryFn: () => {
      if (lat === null || lng === null) {
        throw new Error('위치 정보가 없습니다');
      }
      return fetchNearbyToilets({ lat, lng, radiusMeters });
    },
    enabled: lat !== null && lng !== null,
    staleTime: 30_000, // 30초 캐시
  });

  return {
    toilets: data ?? [],
    isLoading,
    error: (error as Error | null),
    refetch,
  };
}
