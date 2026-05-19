// 인증 훅 — Zustand store + API 호출
import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { login, logout } from '../api/auth';

interface UseAuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithKakao: (kakaoAccessToken: string) => Promise<void>;
  loginWithApple: (appleIdentityToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const { isAuthenticated, isLoading, saveTokens, clearTokens } = useAuthStore();

  const loginWithKakao = useCallback(
    async (kakaoAccessToken: string) => {
      const response = await login({ provider: 'KAKAO', accessToken: kakaoAccessToken });
      await saveTokens(response.accessToken, response.refreshToken);
    },
    [saveTokens],
  );

  const loginWithApple = useCallback(
    async (appleIdentityToken: string) => {
      const response = await login({ provider: 'APPLE', accessToken: appleIdentityToken });
      await saveTokens(response.accessToken, response.refreshToken);
    },
    [saveTokens],
  );

  const signOut = useCallback(async () => {
    try {
      await logout();
    } finally {
      await clearTokens();
    }
  }, [clearTokens]);

  return {
    isAuthenticated,
    isLoading,
    loginWithKakao,
    loginWithApple,
    signOut,
  };
}
