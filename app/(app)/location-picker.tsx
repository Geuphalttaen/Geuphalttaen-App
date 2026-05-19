// 지도에서 화장실 위치를 선택하는 풀스크린 맵 픽커
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { NaverMapView, type NaverMapViewRef } from '@mj-studio/react-native-naver-map';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLocation } from '@/src/features/map/hooks/useLocation';
import { colors } from '@/src/shared/theme';

// 서울 시청 기본 좌표 (GPS 실패 시 폴백)
const DEFAULT_LAT = 37.5665;
const DEFAULT_LNG = 126.978;

import { apiClient } from '@/src/shared/lib/client';

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const { data } = await apiClient.get<{ address: string }>('/api/v1/geocode/reverse', {
    params: { lat, lng },
  });
  return data.address ?? '';
}

export default function LocationPickerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef<NaverMapViewRef>(null);
  const { lat: gpsLat, lng: gpsLng } = useLocation();

  // 초기 카메라 위치 — 마운트 시점에만 결정, 이후 변경 없음 (피드백 루프 방지)
  const [initialCamera] = useState({
    latitude: gpsLat ?? DEFAULT_LAT,
    longitude: gpsLng ?? DEFAULT_LNG,
    zoom: 16,
  });

  // 사용자가 드래그한 중심 좌표 (제출에 사용)
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: gpsLat ?? DEFAULT_LAT,
    lng: gpsLng ?? DEFAULT_LNG,
  });
  const [address, setAddress] = useState('');
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 좌표가 바뀌면 600ms debounce 후 역지오코딩
  const fetchAddress = useCallback((lat: number, lng: number) => {
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    setIsAddressLoading(true);
    geocodeTimer.current = setTimeout(() => {
      reverseGeocode(lat, lng)
        .then((addr) => setAddress(addr))
        .catch(() => setAddress(''))
        .finally(() => setIsAddressLoading(false));
    }, 600);
  }, []);

  // GPS가 준비되면 카메라를 내 위치로 이동 (최초 1회)
  const gpsApplied = useRef(false);
  useEffect(() => {
    if (!gpsApplied.current && gpsLat !== null && gpsLng !== null) {
      gpsApplied.current = true;
      mapRef.current?.animateCameraTo({ latitude: gpsLat, longitude: gpsLng, zoom: 16 });
      setCenter({ lat: gpsLat, lng: gpsLng });
      fetchAddress(gpsLat, gpsLng);
    }
  }, [gpsLat, gpsLng, fetchAddress]);

  const handleCameraChanged = useCallback(
    (params: { latitude: number; longitude: number }) => {
      setCenter({ lat: params.latitude, lng: params.longitude });
      fetchAddress(params.latitude, params.longitude);
    },
    [fetchAddress],
  );

  const handleConfirm = useCallback(async () => {
    setIsConfirming(true);
    // debounce 중일 수 있으므로 최신 주소 확보
    let finalAddress = address;
    if (!finalAddress) {
      try {
        finalAddress = await reverseGeocode(center.lat, center.lng);
      } catch {
        finalAddress = '';
      }
    }
    setIsConfirming(false);
    router.navigate({
      pathname: '/(app)/report',
      params: {
        pickedLat: String(center.lat),
        pickedLng: String(center.lng),
        pickedAddress: finalAddress,
      },
    });
  }, [address, center, router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <View style={styles.container}>
      {/* 지도 */}
      <NaverMapView
        ref={mapRef}
        style={styles.map}
        camera={initialCamera}
        isShowLocationButton={false}
        isShowCompass={false}
        isShowScaleBar={false}
        isShowZoomControls={false}
        onCameraChanged={handleCameraChanged}
      />

      {/* 중앙 핀 오버레이 (포인터 이벤트 없음) */}
      <View style={styles.pinOverlay} pointerEvents="none">
        <View style={styles.pinCircle} />
        <View style={styles.pinVertical} />
        <View style={styles.pinHorizontal} />
      </View>

      {/* 뒤로가기 버튼 */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 12 }]}
        onPress={handleBack}
        accessibilityLabel="뒤로 가기"
      >
        <Text style={styles.backBtnText}>‹</Text>
      </TouchableOpacity>

      {/* 하단 확인 카드 */}
      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.cardTitle}>위치 선택</Text>
        <View style={styles.addressRow}>
          {isAddressLoading
            ? <ActivityIndicator size="small" color={colors.primary} style={styles.addressLoader} />
            : <Text style={styles.addressText} numberOfLines={2}>
                {address || '지도를 움직여 위치를 선택하세요'}
              </Text>
          }
        </View>
        <TouchableOpacity
          style={[styles.confirmBtn, isConfirming && styles.confirmBtnDisabled]}
          onPress={() => { void handleConfirm(); }}
          disabled={isConfirming}
          accessibilityLabel="이 위치 선택"
        >
          {isConfirming
            ? <ActivityIndicator size="small" color={colors.white} />
            : <Text style={styles.confirmBtnText}>이 위치 선택</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  map: {
    flex: 1,
  },
  pinOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCircle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: colors.primary,
    backgroundColor: 'rgba(26,115,232,0.15)',
  },
  pinVertical: {
    position: 'absolute',
    width: 2,
    height: 36,
    backgroundColor: colors.primary,
  },
  pinHorizontal: {
    position: 'absolute',
    width: 36,
    height: 2,
    backgroundColor: colors.primary,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  backBtnText: {
    fontSize: 24,
    color: colors.text1,
    lineHeight: 28,
  },
  bottomCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text1,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  addressRow: {
    minHeight: 40,
    justifyContent: 'center',
    marginBottom: 14,
  },
  addressText: {
    fontSize: 13,
    color: colors.text2,
    letterSpacing: -0.2,
    lineHeight: 19,
  },
  addressLoader: {
    alignSelf: 'flex-start',
  },
  confirmBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 6,
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.3,
  },
});
