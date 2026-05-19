// 내비게이션 화면 — 현재 위치 → 화장실 경로
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import {
  NaverMapView,
  NaverMapMarkerOverlay,
  NaverMapPathOverlay,
  type NaverMapViewRef,
} from '@mj-studio/react-native-naver-map';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from '@/src/features/map/hooks/useLocation';
import { fetchDirections, type DirectionsResult } from '@/src/features/map/api/directions';
import { useToiletDetail } from '@/src/features/toilets/hooks/useToiletDetail';
import { colors } from '@/src/shared/theme';

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `약 ${minutes}분`;
  return `약 ${Math.floor(minutes / 60)}시간 ${minutes % 60}분`;
}

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${meters}m`;
}

export default function NavigateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef<NaverMapViewRef>(null);
  const { id } = useLocalSearchParams<{ id: string }>();
  const toiletId = Number(id);

  const { lat, lng } = useLocation();
  const { toilet } = useToiletDetail(toiletId);

  const { data: directions, isLoading, error } = useQuery<DirectionsResult>({
    queryKey: ['directions', lat, lng, toilet?.lat, toilet?.lng],
    queryFn: () => fetchDirections({
      startLat: lat!,
      startLng: lng!,
      endLat: toilet!.lat,
      endLng: toilet!.lng,
    }),
    enabled: lat !== null && lng !== null && toilet !== undefined,
    staleTime: 60_000,
  });

  // 경로 로드 후 지도 범위 자동 조정
  useEffect(() => {
    if (directions && directions.path.length > 1 && lat !== null && lng !== null && toilet) {
      const lats = [lat, toilet.lat];
      const lngs = [lng, toilet.lng];
      const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const midLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      const latDelta = (Math.max(...lats) - Math.min(...lats)) * 1.4;
      const zoomLevel = Math.max(10, Math.min(16, 14 - Math.log2(latDelta * 100)));
      mapRef.current?.animateCameraTo({ latitude: midLat, longitude: midLng, zoom: zoomLevel });
    }
  }, [directions, lat, lng, toilet]);

  const pathCoords = directions?.path.map((p) => ({ latitude: p.lat, longitude: p.lng })) ?? [];

  return (
    <View style={styles.container}>
      <NaverMapView
        ref={mapRef}
        style={styles.map}
        camera={{
          latitude: lat ?? (toilet?.lat ?? 37.5665),
          longitude: lng ?? (toilet?.lng ?? 126.978),
          zoom: 14,
        }}
        isShowLocationButton={false}
        isShowCompass={false}
        isShowScaleBar={false}
        isShowZoomControls={false}
      >
        {/* 출발지 (현재 위치) */}
        {lat !== null && lng !== null && (
          <NaverMapMarkerOverlay
            latitude={lat}
            longitude={lng}
            anchor={{ x: 0.5, y: 0.5 }}
            width={16}
            height={16}
          >
            <View style={styles.myLocationDot} />
          </NaverMapMarkerOverlay>
        )}

        {/* 목적지 (화장실) */}
        {toilet && (
          <NaverMapMarkerOverlay
            latitude={toilet.lat}
            longitude={toilet.lng}
            anchor={{ x: 0.5, y: 1 }}
            width={32}
            height={40}
          >
            <View style={styles.destinationPin}>
              <Text style={styles.destinationPinText}>🚻</Text>
            </View>
          </NaverMapMarkerOverlay>
        )}

        {/* 경로 선 */}
        {pathCoords.length > 1 && (
          <NaverMapPathOverlay
            coords={pathCoords}
            width={6}
            color={colors.primary}
            outlineWidth={2}
            outlineColor="rgba(255,255,255,0.8)"
          />
        )}
      </NaverMapView>

      {/* 뒤로가기 */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 12 }]}
        onPress={() => router.back()}
        accessibilityLabel="뒤로 가기"
      >
        <Text style={styles.backBtnText}>‹</Text>
      </TouchableOpacity>

      {/* 하단 정보 카드 */}
      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 16 }]}>
        {isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>경로 계산 중...</Text>
          </View>
        )}
        {error && (
          <Text style={styles.errorText}>경로를 불러오지 못했습니다</Text>
        )}
        {directions && toilet && (
          <>
            <Text style={styles.destinationName} numberOfLines={1}>{toilet.name}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDistance(directions.distanceMeters)}</Text>
                <Text style={styles.statLabel}>거리</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatDuration(directions.durationMs)}</Text>
                <Text style={styles.statLabel}>소요 시간</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  myLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    borderWidth: 2.5,
    borderColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  destinationPin: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationPinText: { fontSize: 28 },
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  backBtnText: { fontSize: 24, color: colors.text1, lineHeight: 28 },
  bottomCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  loadingText: { fontSize: 14, color: colors.text2 },
  errorText: { fontSize: 14, color: colors.danger, paddingVertical: 12 },
  destinationName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text1,
    letterSpacing: -0.4,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text3,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
});
