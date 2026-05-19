// DetailScreen 단위 테스트
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DetailScreen from '../../toilet/[id]';
import { type ToiletResponse } from '@/src/features/toilets/api';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    Svg: ({ children }: { children?: React.ReactNode }) => <View>{children}</View>,
    Circle: () => <View />,
    Path: () => <View />,
  };
});

const mockToilet: ToiletResponse = {
  id: 42,
  name: '서울숲공원 공중화장실',
  address: '성동구 뚝섬로 273',
  lat: 37.5445,
  lng: 127.0374,
  distanceMeters: 120,
  male: true,
  female: true,
  disabled: true,
  familyRoom: false,
  isPublic: true,
};

const mockFetchToiletDetail = jest.fn().mockResolvedValue(mockToilet);
jest.mock('@/src/features/toilets/api', () => ({
  fetchToiletDetail: (...args: unknown[]) => mockFetchToiletDetail(...args),
}));

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
  useLocalSearchParams: () => ({ id: '42' }),
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require('react-native');
    return <Text>{`Redirect to ${href}`}</Text>;
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('DetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchToiletDetail.mockResolvedValue(mockToilet);
  });

  it('초기 렌더링 시 화장실 이름이 없다', () => {
    render(<DetailScreen />, { wrapper: createWrapper() });
    expect(screen.queryByText('서울숲공원 공중화장실')).toBeNull();
  });

  it('데이터 로드 후 화장실 이름이 렌더링된다', async () => {
    render(<DetailScreen />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('서울숲공원 공중화장실')).toBeTruthy();
    });
  });

  it('데이터 로드 후 주소가 렌더링된다', async () => {
    render(<DetailScreen />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('성동구 뚝섬로 273')).toBeTruthy();
    });
  });

  it('뒤로 가기 버튼 클릭 시 back이 호출된다', async () => {
    render(<DetailScreen />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('서울숲공원 공중화장실')).toBeTruthy();
    });
    const backBtn = screen.getByText('‹');
    fireEvent.press(backBtn);
    expect(mockBack).toHaveBeenCalled();
  });

  it('API 에러 시 재시도 버튼이 표시된다', async () => {
    mockFetchToiletDetail.mockRejectedValueOnce(new Error('서버 오류'));
    render(<DetailScreen />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('다시 시도')).toBeTruthy();
    });
  });

  it('시설 정보 섹션 레이블이 표시된다', async () => {
    render(<DetailScreen />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText(/시설 정보/)).toBeTruthy();
    });
  });

  it('리뷰 작성 CTA 버튼이 표시된다', async () => {
    render(<DetailScreen />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('★ 리뷰 작성하기')).toBeTruthy();
    });
  });
});
