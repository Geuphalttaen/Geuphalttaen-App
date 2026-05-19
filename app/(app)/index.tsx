// 지도 메인 화면 — react-native-maps + expo-location
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ToiletMarker } from '@/src/features/map/components/ToiletMarker';
import { FacilityIcon } from '@/src/features/toilets/components/FacilityIcon';
import { StatusBadge } from '@/src/features/toilets/components/StatusBadge';
import { useLocation } from '@/src/features/map/hooks/useLocation';
import { useNearbyToilets } from '@/src/features/map/hooks/useNearbyToilets';
import { type ToiletResponse } from '@/src/features/toilets/api';
import { colors } from '@/src/shared/theme';

const RADIUS_OPTIONS = [300, 500, 1000] as const;
type RadiusOption = (typeof RADIUS_OPTIONS)[number];

function formatDistance(meters: number | null): string {
  if (meters === null) return '-';
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [selectedRadius, setSelectedRadius] = useState<RadiusOption>(500);
  const [selectedToilet, setSelectedToilet] = useState<ToiletResponse | null>(null);

  const { lat, lng, isLoading: locationLoading, error: locationError } = useLocation();
  const { toilets, isLoading: toiletsLoading, error: toiletsError } = useNearbyToilets({
    lat,
    lng,
    radiusMeters: selectedRadius,
  });

  const handleMarkerPress = useCallback(
    (id: number) => {
      const toilet = toilets.find((t) => t.id === id) ?? null;
      setSelectedToilet(toilet);
    },
    [toilets],
  );

  const handleMyLocation = useCallback(() => {
    if (lat !== null && lng !== null) {
      const region: Region = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      mapRef.current?.animateToRegion(region, 500);
    }
  }, [lat, lng]);

  const handleDetailPress = useCallback(() => {
    if (selectedToilet) {
      router.push(`/(app)/toilet/${selectedToilet.id}`);
    }
  }, [selectedToilet, router]);

  const isLoading = locationLoading || toiletsLoading;
  const error = locationError ?? toiletsError?.message ?? null;

  const initialRegion: Region = {
    latitude: lat ?? 37.5665,
    longitude: lng ?? 126.978,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      {/* 지도 */}
      {!locationLoading && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {toilets.map((toilet) => (
            <ToiletMarker
              key={toilet.id}
              id={toilet.id}
              lat={toilet.lat}
              lng={toilet.lng}
              status="open"
              selected={selectedToilet?.id === toilet.id}
              onPress={handleMarkerPress}
            />
          ))}
        </MapView>
      )}

      {/* 로딩 오버레이 */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* 에러 메시지 */}
      {error && !isLoading && (
        <View style={[styles.errorBanner, { top: insets.top + 16 }]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 검색 바 */}
      <View style={[styles.searchBar, { top: insets.top + 8 }]}>
        <Text style={styles.searchBarTitle} numberOfLines={1}>
          {lat !== null ? '내 위치 기반' : '위치 확인 중...'}
        </Text>
        <TouchableOpacity
          style={styles.searchIconBtn}
          onPress={() => router.push('/(app)/list')}
          accessibilityLabel="목록 보기"
        >
          <Text style={styles.searchIconText}>목록</Text>
        </TouchableOpacity>
      </View>

      {/* 반경 필터 칩 */}
      <View style={[styles.chipsRow, { top: insets.top + 72 }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
        >
          {RADIUS_OPTIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.chip, selectedRadius === r && styles.chipActive]}
              onPress={() => setSelectedRadius(r)}
              accessibilityLabel={`반경 ${r}m`}
            >
              <Text style={[styles.chipText, selectedRadius === r && styles.chipTextActive]}>
                {r >= 1000 ? `${r / 1000}km` : `${r}m`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 제보 FAB */}
      <TouchableOpacity
        style={[styles.fab, { top: insets.top + 120 }]}
        onPress={() => router.push('/(app)/report')}
        accessibilityLabel="화장실 제보하기"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* 내 위치 버튼 */}
      <TouchableOpacity
        style={[styles.myLocationBtn, { bottom: selectedToilet ? 340 : 100 }]}
        onPress={handleMyLocation}
        accessibilityLabel="내 위치로 이동"
      >
        <Text style={styles.myLocationIcon}>⊙</Text>
      </TouchableOpacity>

      {/* 선택된 화장실 바텀시트 */}
      {selectedToilet && (
        <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 16 }]}>
          {/* 핸들 */}
          <View style={styles.sheetHandle} />

          {/* 상태 행 */}
          <View style={styles.sheetStatusRow}>
            <StatusBadge status="open" />
            <View style={styles.sheetTypeBadge}>
              <Text style={styles.sheetTypeBadgeText}>
                {selectedToilet.isPublic ? '공공' : '제보됨'}
              </Text>
            </View>
          </View>

          {/* 이름 + 거리 */}
          <View style={styles.sheetTitleRow}>
            <View style={styles.sheetTitleContent}>
              <Text style={styles.sheetName}>{selectedToilet.name}</Text>
              <Text style={styles.sheetAddress}>{selectedToilet.address}</Text>
            </View>
            <View style={styles.sheetDistance}>
              <Text style={styles.sheetDistanceText}>
                {formatDistance(selectedToilet.distanceMeters)}
              </Text>
            </View>
          </View>

          {/* 시설 아이콘 + 상세 버튼 */}
          <View style={styles.sheetFooter}>
            <View style={styles.sheetFacilities}>
              {selectedToilet.male && <FacilityIcon type="male" available />}
              {selectedToilet.female && <FacilityIcon type="female" available />}
              {selectedToilet.disabled && <FacilityIcon type="disabled" available />}
              {selectedToilet.familyRoom && <FacilityIcon type="familyRoom" available />}
            </View>
            <TouchableOpacity
              style={styles.sheetDetailBtn}
              onPress={handleDetailPress}
              accessibilityLabel="상세 보기"
            >
              <Text style={styles.sheetDetailBtnText}>상세 보기</Text>
            </TouchableOpacity>
          </View>

          {/* 닫기 버튼 */}
          <TouchableOpacity
            style={styles.sheetCloseBtn}
            onPress={() => setSelectedToilet(null)}
            accessibilityLabel="닫기"
          >
            <Text style={styles.sheetCloseBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  errorBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: colors.danger,
    borderRadius: 12,
    padding: 12,
    zIndex: 20,
  },
  errorText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  searchBarTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text1,
    letterSpacing: -0.3,
  },
  searchIconBtn: {
    width: 48,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconText: {
    fontSize: 13,
    color: colors.text1,
    fontWeight: '600',
  },
  chipsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 8,
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  chipActive: {
    backgroundColor: colors.text1,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text1,
  },
  chipTextActive: {
    color: colors.white,
  },
  fab: {
    position: 'absolute',
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  fabText: {
    fontSize: 28,
    color: colors.white,
    lineHeight: 32,
    fontWeight: '300',
  },
  myLocationBtn: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  myLocationIcon: {
    fontSize: 22,
    color: colors.primary,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sheetTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  sheetTypeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  sheetTitleContent: {
    flex: 1,
    minWidth: 0,
  },
  sheetName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text1,
    letterSpacing: -0.5,
    lineHeight: 25,
  },
  sheetAddress: {
    fontSize: 13,
    color: colors.text2,
    marginTop: 4,
    letterSpacing: -0.2,
  },
  sheetDistance: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  sheetDistanceText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.6,
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sheetFacilities: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  sheetDetailBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  sheetDetailBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  sheetCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 20,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCloseBtnText: {
    fontSize: 16,
    color: colors.text2,
  },
});
