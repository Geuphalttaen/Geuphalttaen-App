// 현재 위치 훅 — expo-location 활용
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  isLoading: boolean;
}

export function useLocation(): LocationState {
  const [state, setState] = useState<LocationState>({
    lat: null,
    lng: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function getLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) {
            setState({ lat: null, lng: null, error: '위치 권한이 필요합니다', isLoading: false });
          }
          return;
        }
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setState({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            error: null,
            isLoading: false,
          });
        }
      } catch {
        if (!cancelled) {
          setState({ lat: null, lng: null, error: '위치를 가져올 수 없습니다', isLoading: false });
        }
      }
    }

    void getLocation();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
