// 리뷰 / 청결도 API + zod 스키마
import { z } from 'zod';
import { apiClient } from '@/src/shared/lib/client';

// ─── 스키마 ──────────────────────────────────────────────────────
export const ReviewResponseSchema = z.object({
  id: z.number(),
  toiletId: z.number(),
  userId: z.number(),
  nickname: z.string().nullable().optional(),
  rating: z.number().min(1).max(5),
  content: z.string().nullable().optional(),
  createdAt: z.string().datetime({ local: true }),
});
export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;

export const PageReviewSchema = z.object({
  content: z.array(ReviewResponseSchema),
  totalElements: z.number(),
  totalPages: z.number(),
  number: z.number(),
  size: z.number(),
  last: z.boolean(),
});
export type PageReview = z.infer<typeof PageReviewSchema>;

export const CleanlinessResponseSchema = z.object({
  toiletId: z.number(),
  userId: z.number(),
  score: z.number(),
});
export type CleanlinessResponse = z.infer<typeof CleanlinessResponseSchema>;

// ─── API 함수 ────────────────────────────────────────────────────
export async function fetchReviews(toiletId: number, page = 0, size = 10): Promise<PageReview> {
  const { data } = await apiClient.get(`/api/v1/toilets/${toiletId}/reviews`, {
    params: { page, size },
  });
  return PageReviewSchema.parse(data);
}

export async function submitReview(
  toiletId: number,
  rating: number,
  content?: string,
): Promise<ReviewResponse> {
  const { data } = await apiClient.post(`/api/v1/toilets/${toiletId}/reviews`, {
    rating,
    content: content ?? null,
  });
  return ReviewResponseSchema.parse(data);
}

export async function fetchMyReview(toiletId: number): Promise<ReviewResponse | null> {
  const { data } = await apiClient.get(`/api/v1/toilets/${toiletId}/reviews/my`);
  if (data === null || data === undefined) return null;
  return ReviewResponseSchema.parse(data);
}

export async function updateReview(
  toiletId: number,
  rating: number,
  content?: string,
): Promise<ReviewResponse> {
  const { data } = await apiClient.patch(`/api/v1/toilets/${toiletId}/reviews/my`, {
    rating,
    content: content ?? null,
  });
  return ReviewResponseSchema.parse(data);
}

export async function fetchMyCleanliness(toiletId: number): Promise<CleanlinessResponse | null> {
  const { data } = await apiClient.get(`/api/v1/toilets/${toiletId}/cleanliness/my`);
  if (data === null || data === undefined) return null;
  return CleanlinessResponseSchema.parse(data);
}

export async function submitCleanliness(
  toiletId: number,
  score: number,
): Promise<CleanlinessResponse> {
  const { data } = await apiClient.post(`/api/v1/toilets/${toiletId}/cleanliness`, { score });
  return CleanlinessResponseSchema.parse(data);
}
