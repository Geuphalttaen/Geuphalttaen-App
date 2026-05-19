// AuthScreen 단위 테스트
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthScreen from './index';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-apple-authentication', () => ({
  signInAsync: jest.fn().mockResolvedValue({ identityToken: 'mock-token' }),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
}));

jest.mock('@react-native-seoul/kakao-login', () => ({
  login: jest.fn().mockResolvedValue({ accessToken: 'kakao-mock-token' }),
}));

jest.mock('../../api/auth', () => ({
  login: jest.fn().mockResolvedValue({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  }),
  logout: jest.fn().mockResolvedValue(undefined),
}));

const mockReplace = jest.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>{children}</NavigationContainer>
      </QueryClientProvider>
    );
  };
}

const mockRoute = { key: 'Auth', name: 'Auth' as const, params: undefined };
const mockNavigation = {
  replace: mockReplace,
  navigate: jest.fn(),
  goBack: jest.fn(),
} as unknown as Parameters<typeof AuthScreen>[0]['navigation'];

describe('AuthScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('브랜드 타이틀이 렌더링된다', () => {
    render(<AuthScreen route={mockRoute} navigation={mockNavigation} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText('급할땐')).toBeTruthy();
  });

  it('카카오 로그인 버튼이 렌더링된다', () => {
    render(<AuthScreen route={mockRoute} navigation={mockNavigation} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText('카카오로 시작하기')).toBeTruthy();
  });

  it('둘러보기 버튼 클릭 시 Map 화면으로 이동한다', () => {
    render(<AuthScreen route={mockRoute} navigation={mockNavigation} />, {
      wrapper: createWrapper(),
    });
    const browseBtn = screen.getByText('로그인 없이 둘러보기');
    fireEvent.press(browseBtn);
    expect(mockReplace).toHaveBeenCalledWith('Map');
  });

  it('서브타이틀 문구가 렌더링된다', () => {
    render(<AuthScreen route={mockRoute} navigation={mockNavigation} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText('가장 가까운 공중화장실, 지금 바로')).toBeTruthy();
  });

  it('로그인 없이 둘러보기 링크가 렌더링된다', () => {
    render(<AuthScreen route={mockRoute} navigation={mockNavigation} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText('로그인 없이 둘러보기')).toBeTruthy();
  });
});
