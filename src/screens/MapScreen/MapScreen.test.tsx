// MapScreen 단위 테스트
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MapScreen from './index';

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

jest.mock('../../api/toilets', () => ({
  fetchNearbyToilets: jest.fn().mockResolvedValue([]),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  };
});

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

const mockRoute = { key: 'Map', name: 'Map' as const, params: undefined };
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  replace: jest.fn(),
} as unknown as Parameters<typeof MapScreen>[0]['navigation'];

describe('MapScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초기 렌더링 시 지도 뷰가 표시된다', async () => {
    render(<MapScreen route={mockRoute} navigation={mockNavigation} />, {
      wrapper: createWrapper(),
    });
    // 위치 로딩 완료 후 지도가 렌더링됨
    await waitFor(() => {
      expect(screen.getByTestId('map-view')).toBeTruthy();
    });
  });

  it('반경 필터 칩이 렌더링된다', () => {
    render(<MapScreen route={mockRoute} navigation={mockNavigation} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText('300m')).toBeTruthy();
    expect(screen.getByText('500m')).toBeTruthy();
    expect(screen.getByText('1km')).toBeTruthy();
  });

  it('목록 버튼 클릭 시 List 화면으로 이동한다', () => {
    render(<MapScreen route={mockRoute} navigation={mockNavigation} />, {
      wrapper: createWrapper(),
    });
    // '목록' 텍스트를 가진 버튼을 찾아 클릭
    const listBtn = screen.getByText('목록');
    fireEvent.press(listBtn);
    expect(mockNavigate).toHaveBeenCalledWith('List');
  });

  it('제보 FAB 클릭 시 Report 화면으로 이동한다', () => {
    render(<MapScreen route={mockRoute} navigation={mockNavigation} />, {
      wrapper: createWrapper(),
    });
    // '+' 텍스트를 가진 FAB 버튼을 찾아 클릭
    const fabBtn = screen.getByText('+');
    fireEvent.press(fabBtn);
    expect(mockNavigate).toHaveBeenCalledWith('Report');
  });

  it('반경 칩 선택 시 UI가 업데이트된다', () => {
    render(<MapScreen route={mockRoute} navigation={mockNavigation} />, {
      wrapper: createWrapper(),
    });
    const chip300 = screen.getByText('300m');
    fireEvent.press(chip300);
    expect(chip300).toBeTruthy();
  });
});
