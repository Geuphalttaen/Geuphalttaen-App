// 인증 상태 관리 — Zustand + expo-secure-store
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../api/client';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  // 토큰은 SecureStore에만 저장, 인메모리 보관 금지
  setAuthenticated: (authenticated: boolean) => void;
  saveTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  clearTokens: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,

  setAuthenticated: (authenticated: boolean) => set({ isAuthenticated: authenticated }),

  saveTokens: async (accessToken: string, refreshToken: string) => {
    // 반드시 SecureStore 사용 — AsyncStorage 평문 저장 금지
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    set({ isAuthenticated: true });
  },

  clearTokens: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    set({ isAuthenticated: false });
  },

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      set({ isAuthenticated: !!token, isLoading: false });
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));
