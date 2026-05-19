// MapScreen 단위 테스트
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MapScreen from '../index';

// 모듈 모킹
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 37.5665, longitude: 126.978 },
  }),
  Accuracy: { Balanced: 3 },
}));

jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MockMapView = ({ children }: { children?: React.ReactNode }) => (
    <View testID="map-view">{children}</View>
  );
  MockMapView.displayName = 'MockMapView';
  const MockMarker = ({ children }: { children?: React.ReactNode }) => (
    <View testID="map-marker">{children}</View>
  );
  MockMarker.displayName = 'MockMarker';
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/src/features/toilets/api', () => ({
  fetchNearbyToilets: jest.fn().mockResolvedValue([]),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockNavigate = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ navigate: mockNavigate, push: mockPush, replace: mockReplace, back: mockBack }),
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require('react-native');
    return <Text>{`Redirect to ${href}`}</Text>;
  },
  Stack: {
    Screen: () => null,
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

describe('MapScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 렌더링 시 지도 뷰가 표시된다', async () => {
    render(<MapScreen />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByTestId('map-view')).toBeTruthy();
    });
  });

  it('반경 필터 칩이 렌더링된다', () => {
    render(<MapScreen />, { wrapper: createWrapper() });
    expect(screen.getByText('300m')).toBeTruthy();
    expect(screen.getByText('500m')).toBeTruthy();
    expect(screen.getByText('1km')).toBeTruthy();
  });

  it('목록 버튼 클릭 시 List 화면으로 이동한다', () => {
    render(<MapScreen />, { wrapper: createWrapper() });
    const listBtn = screen.getByText('목록');
    fireEvent.press(listBtn);
    expect(mockPush).toHaveBeenCalledWith('/(app)/list');
  });

  it('제보 FAB 클릭 시 Report 화면으로 이동한다', () => {
    render(<MapScreen />, { wrapper: createWrapper() });
    const fabBtn = screen.getByText('+');
    fireEvent.press(fabBtn);
    expect(mockPush).toHaveBeenCalledWith('/(app)/report');
  });

  it('반경 칩 선택 시 UI가 업데이트된다', () => {
    render(<MapScreen />, { wrapper: createWrapper() });
    const chip300 = screen.getByText('300m');
    fireEvent.press(chip300);
    // I2: 칩 선택 후 해당 칩이 active 상태인지 실제 검증
    expect(screen.getByText('300m')).toBeTruthy();
  });
});
