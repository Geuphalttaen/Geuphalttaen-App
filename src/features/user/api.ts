// 사용자 API 엔드포인트 + zod 스키마
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/src/shared/lib/client';

export const DEFAULT_NICKNAME = '사용자';

export const USER_QUERY_KEYS = {
  profile: ['user', 'profile'] as const,
  reports: ['user', 'reports'] as const,
} as const;

export const UserProfileSchema = z.object({
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

export async function fetchMyProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get('/api/v1/users/me');
  return UserProfileSchema.parse(data);
}

async function fetchMyReports(): Promise<MyReport[]> {
  const { data } = await apiClient.get('/api/v1/users/me/reports');
  return MyReportListSchema.parse(data);
}

export function useMyProfile() {
  return useQuery({
    queryKey: USER_QUERY_KEYS.profile,
    queryFn: fetchMyProfile,
  });
}

export function useMyReports() {
  return useQuery({
    queryKey: USER_QUERY_KEYS.reports,
    queryFn: fetchMyReports,
  });
}

async function patchNickname(nickname: string): Promise<UserProfile> {
  const { data } = await apiClient.patch('/api/v1/users/me', { nickname });
  return UserProfileSchema.parse(data);
}

export function useUpdateNickname() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patchNickname,
    onSuccess: (updated) => {
      queryClient.setQueryData(['user', 'profile'], updated);
    },
  });
}
