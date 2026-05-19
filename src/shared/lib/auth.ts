// 인증 API 엔드포인트 + zod 스키마
import { z } from 'zod';
import { apiClient } from './client';

// ─── zod 스키마 ───────────────────────────────────────────────
export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const LoginRequestSchema = z.object({
  provider: z.enum(['KAKAO', 'APPLE']),
  accessToken: z.string(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// ─── API 함수 ─────────────────────────────────────────────────
export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post('/api/v1/auth/login', payload);
  return AuthResponseSchema.parse(data);
}

export async function refreshToken(token: string): Promise<AuthResponse> {
  const { data } = await apiClient.post('/api/v1/auth/refresh', { refreshToken: token });
  return AuthResponseSchema.parse(data);
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/v1/auth/logout');
}
