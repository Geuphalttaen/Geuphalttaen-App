// 내 제보 목록 화면
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMyReports, type MyReport } from '@/src/features/user/api';
import { colors } from '@/src/shared/theme';

type FilterType = 'ALL' | 'ACTIVE' | 'PENDING' | 'REJECTED';

interface FilterChip {
  key: FilterType;
  label: string;
  dotColor?: string;
}

const FILTERS: FilterChip[] = [
  { key: 'ALL', label: '전체' },
  { key: 'ACTIVE', label: '게시됨', dotColor: colors.success },
  { key: 'PENDING', label: '검토중', dotColor: colors.warning },
  { key: 'REJECTED', label: '반려', dotColor: colors.danger },
];

const STATUS_CONFIG = {
  ACTIVE: { label: '게시됨', bg: 'rgba(52,168,83,0.12)', color: '#1F7A38', dot: colors.success },
  PENDING: { label: '검토중', bg: 'rgba(251,188,4,0.12)', color: '#A37A00', dot: colors.warning },
  REJECTED: { label: '반려', bg: 'rgba(234,67,53,0.10)', color: '#B5281D', dot: colors.danger },
} as const;

function MapPinIcon() {
  return (
    <View style={thumbIconStyles.wrap}>
      <View style={thumbIconStyles.pin} />
      <View style={thumbIconStyles.tail} />
    </View>
  );
}

const thumbIconStyles = StyleSheet.create({
  wrap: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  pin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.text3,
    backgroundColor: 'transparent',
    marginBottom: -2,
  },
  tail: {
    width: 2,
    height: 6,
    backgroundColor: colors.text3,
    borderRadius: 1,
  },
});

interface ReportCardProps {
  report: MyReport;
}

function ReportCard({ report }: ReportCardProps) {
  const s = STATUS_CONFIG[report.status];
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.thumb}>
        <MapPinIcon />
      </View>
      <View style={cardStyles.body}>
        <View style={cardStyles.badgeRow}>
          <View style={[cardStyles.badge, { backgroundColor: s.bg }]}>
            <View style={[cardStyles.badgeDot, { backgroundColor: s.dot }]} />
            <Text style={[cardStyles.badgeText, { color: s.color }]}>{s.label}</Text>
          </View>
        </View>
        <Text style={cardStyles.name} numberOfLines={1}>{report.name}</Text>
        <Text style={cardStyles.addr} numberOfLines={1}>{report.address}</Text>
        <Text style={cardStyles.date}>{report.createdAt}</Text>
      </View>
      <View style={cardStyles.chevronWrap}>
        <View style={[cardStyles.chevronArm, cardStyles.chevronTop]} />
        <View style={[cardStyles.chevronArm, cardStyles.chevronBottom]} />
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: { flex: 1, minWidth: 0 },
  badgeRow: { flexDirection: 'row', marginBottom: 4 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeDot: { width: 5, height: 5, borderRadius: 2.5 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: -0.1 },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text1,
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  addr: {
    fontSize: 12,
    color: colors.text2,
    marginTop: 3,
    letterSpacing: -0.2,
  },
  date: {
    fontSize: 11,
    color: colors.text3,
    marginTop: 6,
    letterSpacing: 0.2,
  },
  chevronWrap: {
    width: 8,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    flexShrink: 0,
  },
  chevronArm: {
    position: 'absolute',
    width: 9,
    height: 1.6,
    backgroundColor: colors.text3,
    borderRadius: 1,
  },
  chevronTop: { transform: [{ rotate: '45deg' }, { translateY: -3 }] },
  chevronBottom: { transform: [{ rotate: '-45deg' }, { translateY: 3 }] },
});

export default function MyReportsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const { data: reports = [], isLoading } = useMyReports();

  const filtered = activeFilter === 'ALL'
    ? reports
    : reports.filter((r) => r.status === activeFilter);

  const countByStatus = (key: FilterType) =>
    key === 'ALL' ? reports.length : reports.filter((r) => r.status === key).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 상단 네비게이션 바 */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <View style={styles.backIcon}>
            <View style={[styles.backArm, styles.backTop]} />
            <View style={[styles.backArm, styles.backBottom]} />
          </View>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>내 제보 목록</Text>
        <View style={styles.topBarRight} />
      </View>

      {/* 카운트 + 필터 헤더 */}
      <View style={styles.header}>
        <Text style={styles.totalCount}>
          총 <Text style={styles.totalCountAccent}>{reports.length}</Text>건
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveFilter(f.key)}
              >
                {f.dotColor && !isActive && (
                  <View style={[styles.chipDot, { backgroundColor: f.dotColor }]} />
                )}
                <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                  {f.label}
                </Text>
                <Text style={[styles.chipCount, isActive && styles.chipCountActive]}>
                  {countByStatus(f.key)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 목록 */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>제보 내역이 없습니다</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ReportCard report={item} />}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  backIcon: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  backArm: {
    position: 'absolute',
    width: 10,
    height: 2,
    backgroundColor: colors.text1,
    borderRadius: 1,
  },
  backTop: { transform: [{ rotate: '-45deg' }, { translateY: -3 }] },
  backBottom: { transform: [{ rotate: '45deg' }, { translateY: 3 }] },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text1,
    letterSpacing: -0.3,
  },
  topBarRight: { width: 40 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 16,
  },
  totalCount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text1,
    letterSpacing: -0.6,
    lineHeight: 34,
    marginBottom: 12,
  },
  totalCountAccent: { color: colors.primary },
  filterRow: { gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.text1,
    borderColor: colors.text1,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text1,
  },
  chipLabelActive: { color: colors.white },
  chipCount: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text2,
    opacity: 0.6,
  },
  chipCountActive: { color: colors.white },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.text3,
    fontWeight: '500',
  },
});
