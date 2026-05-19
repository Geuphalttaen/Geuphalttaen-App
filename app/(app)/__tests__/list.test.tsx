// ListScreen 단위 테스트
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ListScreen from '../list';
import { type ToiletResponse } from '@/src/features/toilets/api';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 37.5665, longitude: 126.978 },
  }),
  Accuracy: { Balanced: 3 },
}));

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

const mockToilets: ToiletResponse[] = [
  {
    id: 1,
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
  },
  {
    id: 2,
    name: '성수역 1번 출구',
    address: '성동구 아차산로 100',
    lat: 37.5447,
    lng: 127.0563,
    distanceMeters: 240,
    male: true,
    female: true,
    disabled: false,
    familyRoom: false,
    isPublic: true,
  },
];

const mockFetchNearbyToilets = jest.fn().mockResolvedValue(mockToilets);
jest.mock('@/src/features/toilets/api', () => ({
  fetchNearbyToilets: (...args: unknown[]) => mockFetchNearbyToilets(...args),
}));

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
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

describe('ListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchNearbyToilets.mockResolvedValue(mockToilets);
  });

  it('초기 렌더링 시 로딩 메시지가 표시된다', () => {
    render(<ListScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('화장실 정보를 불러오는 중...')).toBeTruthy();
  });

  it('데이터 로드 후 화장실 목록이 렌더링된다', async () => {
    render(<ListScreen />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('서울숲공원 공중화장실')).toBeTruthy();
    });
    expect(screen.getByText('성수역 1번 출구')).toBeTruthy();
  });

  it('화장실 카드 클릭 시 Detail 화면으로 이동한다', async () => {
    render(<ListScreen />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('서울숲공원 공중화장실')).toBeTruthy();
    });
    fireEvent.press(screen.getByText('서울숲공원 공중화장실'));
    expect(mockPush).toHaveBeenCalledWith('/(app)/toilet/1');
  });

  it('API 에러 시 재시도 버튼이 표시된다', async () => {
    mockFetchNearbyToilets.mockRejectedValueOnce(new Error('네트워크 오류'));
    render(<ListScreen />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('다시 시도')).toBeTruthy();
    });
  });

  it('공공만 필터 버튼이 렌더링된다', async () => {
    render(<ListScreen />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('공공만')).toBeTruthy();
    });
  });
});
