// 내 리뷰 조회 훅 — 로그인 상태에서만 쿼리 실행
import { useQuery } from '@tanstack/react-query';
import { fetchMyReview, type ReviewResponse } from '@/src/features/reviews/api';
import { useAuthStore } from '@/src/features/auth/store';

interface UseMyReviewResult {
  myReview: ReviewResponse | null;
  isLoading: boolean;
}

export function useMyReview(toiletId: number): UseMyReviewResult {
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', toiletId, 'my'],
    queryFn: () => fetchMyReview(toiletId),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  return {
    myReview: data ?? null,
    isLoading,
  };
}
