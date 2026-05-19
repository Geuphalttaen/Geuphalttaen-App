// 화장실 API 엔드포인트 + zod 스키마
import { z } from 'zod';
import { apiClient } from './client';

// ─── zod 스키마 ───────────────────────────────────────────────
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
});

export const ToiletListResponseSchema = z.array(ToiletResponseSchema);

export const ReportRequestSchema = z.object({
  name: z.string().min(1, '화장실 이름을 입력해 주세요'),
  address: z.string().min(1, '주소를 입력해 주세요'),
  toiletType: z.enum(['PUBLIC', 'CONVENIENCE_STORE', 'CAFE', 'OTHER']),
  male: z.boolean(),
  female: z.boolean(),
  disabled: z.boolean(),
  familyRoom: z.boolean(),
  memo: z.string().max(200).optional(),
});

export type ToiletResponse = z.infer<typeof ToiletResponseSchema>;
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
