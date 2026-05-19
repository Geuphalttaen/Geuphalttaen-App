// 화장실 목록 카드 컴포넌트
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { type ToiletResponse } from '../api/toilets';
import { FacilityIcon } from './FacilityIcon';
import { colors } from '../theme/colors';

interface ToiletCardProps {
  toilet: ToiletResponse;
  onPress: () => void;
}

function formatDistance(meters: number | null): string {
  if (meters === null) return '-';
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function estimateWalkMinutes(meters: number | null): number | null {
  if (meters === null) return null;
  return Math.ceil(meters / 80);
}

export function ToiletCard({ toilet, onPress }: ToiletCardProps) {
  const dist = toilet.distanceMeters;
  const walkMin = estimateWalkMinutes(dist);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* 거리 뱃지 */}
      <View style={styles.distanceBadge}>
        <Text style={styles.distanceText}>{formatDistance(dist)}</Text>
        {walkMin !== null && <Text style={styles.walkText}>도보 {walkMin}분</Text>}
        <View
          style={[
            styles.statusDot,
            { backgroundColor: toilet.isPublic ? colors.success : colors.text3 },
          ]}
        />
      </View>

      {/* 내용 */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {toilet.name}
        </Text>
        <Text style={styles.address} numberOfLines={1}>
          {toilet.address}
        </Text>

        {/* 시설 아이콘 */}
        <View style={styles.facilities}>
          {toilet.male && <FacilityIcon type="male" available size={22} />}
          {toilet.female && <FacilityIcon type="female" available size={22} />}
          {toilet.disabled && <FacilityIcon type="disabled" available size={22} />}
          {toilet.familyRoom && <FacilityIcon type="familyRoom" available size={22} />}
          <View style={styles.spacer} />
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{toilet.isPublic ? '공공' : '제보됨'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  distanceBadge: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: colors.primary08,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
    lineHeight: 20,
  },
  walkText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.7,
  },
  statusDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: colors.bg,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text1,
    letterSpacing: -0.3,
    lineHeight: 20,
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: colors.text2,
    marginBottom: 8,
  },
  facilities: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'nowrap',
  },
  spacer: {
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
});
