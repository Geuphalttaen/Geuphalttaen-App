// axios 인스턴스 + 인터셉터
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 — 저장된 토큰을 Authorization 헤더에 첨부
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// 응답 인터셉터 — 401 시 토큰 갱신 후 재시도
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          return Promise.reject(error);
        }
        const { data } = await axios.post<{ accessToken: string }>(
          `${BASE_URL}/api/v1/auth/refresh`,
          { refreshToken },
        );
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken);
        originalRequest.headers.set('Authorization', `Bearer ${data.accessToken}`);
        return apiClient(originalRequest);
      } catch {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);
