// ReportScreen 단위 테스트
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReportScreen from '../report';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/src/features/map/hooks/useLocation', () => ({
  useLocation: () => ({ lat: 37.5665, lng: 126.978, isLoading: false, error: null }),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('mock-token'),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockSubmitReport = jest.fn().mockResolvedValue(undefined);
jest.mock('@/src/features/toilets/api', () => ({
  submitToiletReport: (...args: unknown[]) => mockSubmitReport(...args),
}));

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require('react-native');
    return <Text testID="redirect">{`Redirect to ${href}`}</Text>;
  },
}));

jest.mock('@/src/features/auth/store', () => ({
  useAuthStore: jest.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('ReportScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useAuthStore } = require('@/src/features/auth/store');
    (useAuthStore as jest.Mock).mockReturnValue({ isAuthenticated: true, isLoading: false });
  });

  it('화면 타이틀이 렌더링된다', () => {
    render(<ReportScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('화장실 위치 제보')).toBeTruthy();
  });

  it('이름 필드가 비어있으면 제출 시 API가 호출되지 않는다', () => {
    render(<ReportScreen />, { wrapper: createWrapper() });
    const submitBtn = screen.getByText('제보 제출하기 ↑');
    fireEvent.press(submitBtn);
    expect(mockSubmitReport).not.toHaveBeenCalled();
  });

  it('화장실 이름 텍스트 필드에 입력이 가능하다', () => {
    render(<ReportScreen />, { wrapper: createWrapper() });
    const nameInput = screen.getByPlaceholderText('예) 서울숲공원 공중화장실');
    fireEvent.changeText(nameInput, '테스트 화장실');
    expect(nameInput.props.value).toBe('테스트 화장실');
  });

  it('주소 텍스트 필드에 입력이 가능하다', () => {
    render(<ReportScreen />, { wrapper: createWrapper() });
    const addressInput = screen.getByPlaceholderText('주소 검색 또는 지도에서 핀 선택');
    fireEvent.changeText(addressInput, '성동구 테스트로 123');
    expect(addressInput.props.value).toBe('성동구 테스트로 123');
  });

  it('닫기 버튼 클릭 시 back이 호출된다', () => {
    render(<ReportScreen />, { wrapper: createWrapper() });
    const closeBtn = screen.getByText('✕');
    fireEvent.press(closeBtn);
    expect(mockBack).toHaveBeenCalled();
  });

  it('시설 체크박스를 토글할 수 있다', () => {
    render(<ReportScreen />, { wrapper: createWrapper() });
    const maleCheckbox = screen.getByText('남성용');
    fireEvent.press(maleCheckbox);
    expect(screen.getByText('남성용')).toBeTruthy();
  });

  it('이름과 주소 입력 후 제출 시 API가 호출된다', async () => {
    render(<ReportScreen />, { wrapper: createWrapper() });
    fireEvent.changeText(
      screen.getByPlaceholderText('예) 서울숲공원 공중화장실'),
      '테스트 화장실',
    );
    fireEvent.changeText(
      screen.getByPlaceholderText('주소 검색 또는 지도에서 핀 선택'),
      '성동구 테스트로 123',
    );
    fireEvent.press(screen.getByText('제보 제출하기 ↑'));
    await waitFor(() => {
      expect(mockSubmitReport.mock.calls[0][0]).toMatchObject({
        name: '테스트 화장실',
        address: '성동구 테스트로 123',
        toiletType: 'PUBLIC',
      });
    });
  });
});

describe('ReportScreen (비로그인)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useAuthStore } = require('@/src/features/auth/store');
    (useAuthStore as jest.Mock).mockReturnValue({ isAuthenticated: false, isLoading: false });
  });

  it('비로그인 시 Redirect 컴포넌트가 로그인 화면을 가리킨다', () => {
    render(<ReportScreen />, { wrapper: createWrapper() });
    expect(screen.getByTestId('redirect')).toBeTruthy();
    expect(screen.getByText('Redirect to /(auth)/login')).toBeTruthy();
  });
});
