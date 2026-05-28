// 내 리뷰 + 청결도 조회 훅 — 로그인 상태에서만 쿼리 실행
import { useQuery } from '@tanstack/react-query';
import {
  fetchMyReview,
  fetchMyCleanliness,
  type ReviewResponse,
  type CleanlinessResponse,
} from '@/src/features/reviews/api';
import { useAuthStore } from '@/src/features/auth/store';

interface UseMyReviewResult {
  myReview: ReviewResponse | null;
  myCleanliness: CleanlinessResponse | null;
  isLoading: boolean;
}

export function useMyReview(toiletId: number): UseMyReviewResult {
  const { isAuthenticated } = useAuthStore();

  const { data: reviewData, isLoading: reviewLoading } = useQuery({
    queryKey: ['reviews', toiletId, 'my'],
    queryFn: () => fetchMyReview(toiletId),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  const { data: cleanlinessData, isLoading: cleanlinessLoading } = useQuery({
    queryKey: ['cleanliness', toiletId, 'my'],
    queryFn: () => fetchMyCleanliness(toiletId),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  return {
    myReview: reviewData ?? null,
    myCleanliness: cleanlinessData ?? null,
    isLoading: reviewLoading || cleanlinessLoading,
  };
}
