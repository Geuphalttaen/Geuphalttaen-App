// 리뷰 목록 훅
import { useQuery } from '@tanstack/react-query';
import { fetchReviews, type PageReview } from '@/src/features/reviews/api';

interface UseReviewsResult {
  page: PageReview | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useReviews(toiletId: number): UseReviewsResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reviews', toiletId],
    queryFn: () => fetchReviews(toiletId),
    staleTime: 30_000,
  });

  return {
    page: data ?? null,
    isLoading,
    error,
    refetch,
  };
}
