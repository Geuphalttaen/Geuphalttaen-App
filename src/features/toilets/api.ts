// 화장실 API 엔드포인트 + zod 스키마
import { z } from 'zod';
import { apiClient } from '@/src/shared/lib/client';

// ─── zod 스키마 ───────────────────────────────────────────────
export const ImageRefSchema = z.object({
  url: z.string(),
  originalUrl: z.string(),
});
export type ImageRef = z.infer<typeof ImageRefSchema>;

const ImageUploadResponseSchema = z.object({
  url: z.string(),
  originalUrl: z.string(),
});
export type ImageUploadResponse = z.infer<typeof ImageUploadResponseSchema>;

export const ToiletResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  distanceMeters: z.number().nullable(),
  male: z.boolean(),
  female: z.boolean(),
  disabled: z.boolean(),
  familyRoom: z.boolean(),
  isPublic: z.boolean(),
  imageUrls: z.array(z.string()).default([]),
});

export const ToiletListResponseSchema = z.array(ToiletResponseSchema);

// H1: lat, lng 필드 추가
export const ReportRequestSchema = z.object({
  name: z.string().min(1, '화장실 이름을 입력해 주세요'),
  address: z.string().min(1, '주소를 입력해 주세요'),
  toiletType: z.enum(['PUBLIC', 'CONVENIENCE_STORE', 'CAFE', 'OTHER']),
  lat: z.number(),
  lng: z.number(),
  male: z.boolean(),
  female: z.boolean(),
  disabled: z.boolean(),
  familyRoom: z.boolean(),
  memo: z.string().max(200).optional(),
  images: z.array(ImageRefSchema).default([]),
});

// imageUrls는 백엔드 응답에 항상 포함되지만 타입상 optional로 선언해
// 기존 테스트 픽스처와의 호환성을 유지한다 (파싱 시 default([]) 적용)
export type ToiletResponse = Omit<z.infer<typeof ToiletResponseSchema>, 'imageUrls'> & { imageUrls?: string[] };
export type ReportRequest = z.infer<typeof ReportRequestSchema>;

// ─── API 함수 ─────────────────────────────────────────────────
export interface NearbyToiletsParams {
  lat: number;
  lng: number;
  radiusMeters?: number;
}

export async function fetchNearbyToilets(params: NearbyToiletsParams): Promise<ToiletResponse[]> {
  const { data } = await apiClient.get('/api/v1/toilets', { params });
  return ToiletListResponseSchema.parse(data);
}

export async function fetchToiletDetail(id: number): Promise<ToiletResponse> {
  const { data } = await apiClient.get(`/api/v1/toilets/${id}`);
  return ToiletResponseSchema.parse(data);
}

export async function submitToiletReport(payload: ReportRequest): Promise<void> {
  await apiClient.post('/api/v1/toilets/report', payload);
}

export async function uploadToiletImage(uri: string, mimeType: string = 'image/jpeg'): Promise<ImageUploadResponse> {
  const ext = uri.split('.').pop()?.split('?')[0] ?? 'jpg';
  const formData = new FormData();
  formData.append('file', { uri, name: `image.${ext}`, type: mimeType } as unknown as Blob);
  const { data } = await apiClient.post('/api/v1/toilets/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return ImageUploadResponseSchema.parse(data);
}
