// 리뷰 작성·수정 + 청결도 평가 뮤테이션 훅
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitReview, updateReview, submitCleanliness } from '@/src/features/reviews/api';

interface WriteReviewParams {
  rating: number;
  content?: string;
  cleanlinessScore?: number;
}

export function useWriteReview(toiletId: number, mode: 'create' | 'update' = 'create') {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ rating, content, cleanlinessScore }: WriteReviewParams) => {
      const review =
        mode === 'update'
          ? await updateReview(toiletId, rating, content)
          : await submitReview(toiletId, rating, content);
      // 청결도 실패는 리뷰 저장과 독립적으로 처리 — 실패해도 리뷰는 유지
      if (cleanlinessScore !== undefined) {
        await submitCleanliness(toiletId, cleanlinessScore).catch(() => undefined);
      }
      return review;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reviews', toiletId] });
    },
  });

  return { mutateAsync, isPending, error };
}
