// 사용자 API 엔드포인트 + zod 스키마
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/src/shared/lib/client';

export const UserProfileSchema = z.object({
  id: z.number(),
  nickname: z.string(),
  provider: z.enum(['KAKAO', 'APPLE']),
  reportCount: z.number(),
  postedCount: z.number(),
});

export const MyReportSchema = z.object({
  id: z.number(),
  name: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  status: z.enum(['ACTIVE', 'PENDING', 'REJECTED']),
  createdAt: z.string(),
});

export const MyReportListSchema = z.array(MyReportSchema);

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type MyReport = z.infer<typeof MyReportSchema>;

async function fetchMyProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get('/api/v1/users/me');
  return UserProfileSchema.parse(data);
}

async function fetchMyReports(): Promise<MyReport[]> {
  const { data } = await apiClient.get('/api/v1/users/me/reports');
  return MyReportListSchema.parse(data);
}

export function useMyProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: fetchMyProfile,
  });
}

export function useMyReports() {
  return useQuery({
    queryKey: ['user', 'reports'],
    queryFn: fetchMyReports,
  });
}
