// 리뷰 작성 + 청결도 평가 뮤테이션 훅
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitReview, submitCleanliness } from '@/src/features/reviews/api';

interface WriteReviewParams {
  rating: number;
  content?: string;
  cleanlinessScore?: number;
}

export function useWriteReview(toiletId: number) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ rating, content, cleanlinessScore }: WriteReviewParams) => {
      const review = await submitReview(toiletId, rating, content);
      if (cleanlinessScore !== undefined) {
        await submitCleanliness(toiletId, cleanlinessScore);
      }
      return review;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reviews', toiletId] });
    },
  });

  return { mutateAsync, isPending, error };
}
