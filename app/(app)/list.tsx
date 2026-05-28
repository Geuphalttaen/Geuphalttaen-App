// 화장실 목록 화면
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ToiletCard } from '@/src/features/toilets/components/ToiletCard';
import { useLocation } from '@/src/features/map/hooks/useLocation';
import { useNearbyToilets } from '@/src/features/map/hooks/useNearbyToilets';
import { type ToiletResponse } from '@/src/features/toilets/api';
import { colors } from '@/src/shared/theme';

type SortKey = 'distance' | 'name';

export default function ListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>('distance');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const { lat, lng, isLoading: locationLoading } = useLocation();
  const { toilets, isLoading, error, refetch } = useNearbyToilets({
    lat,
    lng,
    radiusMeters: 500,
  });

  const sortedToilets = [...toilets]
    .filter((t) => !onlyAvailable || t.isPublic)
    .sort((a, b) => {
      if (sortKey === 'distance') {
        return (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity);
      }
      return a.name.localeCompare(b.name, 'ko');
    });

  const handleCardPress = useCallback(
    (toilet: ToiletResponse) => {
      router.push(`/(app)/toilet/${toilet.id}`);
    },
    [router],
  );

  const renderItem: ListRenderItem<ToiletResponse> = useCallback(
    ({ item }) => <ToiletCard toilet={item} onPress={() => handleCardPress(item)} />,
    [handleCardPress],
  );

  const keyExtractor = useCallback((item: ToiletResponse) => String(item.id), []);

  if (locationLoading || isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>화장실 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error.message}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryBtnText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityLabel="뒤로 가기"
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerSubtitle}>반경 500m</Text>
          <Text style={styles.headerTitle}>
            내 주변 화장실{' '}
            <Text style={styles.headerCount}>{sortedToilets.length}</Text>개
          </Text>
        </View>

        {/* 정렬 / 필터 행 */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => setSortKey(sortKey === 'distance' ? 'name' : 'distance')}
            accessibilityLabel="정렬 변경"
          >
            <Text style={styles.sortBtnText}>
              {sortKey === 'distance' ? '거리순' : '이름순'} ▾
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, onlyAvailable && styles.filterBtnActive]}
            onPress={() => setOnlyAvailable((v) => !v)}
            accessibilityLabel="공공화장실만 보기"
          >
            <View style={[styles.availableDot, onlyAvailable && styles.availableDotActive]} />
            <Text style={[styles.filterBtnText, onlyAvailable && styles.filterBtnTextActive]}>
              공공만
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 목록 */}
      {sortedToilets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>주변 화장실이 없어요</Text>
          <Text style={styles.emptySubtitle}>반경을 넓히거나 위치를 확인해 주세요</Text>
        </View>
      ) : (
        <FlatList
          data={sortedToilets}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.surface,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text2,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 0,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    marginLeft: -4,
  },
  backBtnText: {
    fontSize: 22,
    color: colors.text1,
    fontWeight: '400',
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.text3,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text1,
    letterSpacing: -0.6,
    lineHeight: 32,
    marginTop: 4,
  },
  headerCount: {
    color: colors.primary,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.surface2,
  },
  sortBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text1,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterBtnActive: {
    borderColor: colors.success,
    backgroundColor: 'rgba(52,168,83,0.08)',
  },
  availableDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.text3,
  },
  availableDotActive: {
    backgroundColor: colors.success,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text2,
  },
  filterBtnTextActive: {
    fontWeight: '600',
    color: colors.text1,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text1,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text2,
  },
});
