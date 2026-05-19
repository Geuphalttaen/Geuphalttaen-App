// 상태 뱃지 컴포넌트 — 이용가능/혼잡/폐쇄
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/src/shared/theme';

export type ToiletStatus = 'open' | 'busy' | 'closed';

interface StatusBadgeProps {
  status: ToiletStatus;
}

const STATUS_CONFIG: Record<ToiletStatus, { label: string; color: string; bg: string }> = {
  open: { label: '이용 가능', color: colors.success, bg: 'rgba(52,168,83,0.12)' },
  busy: { label: '혼잡', color: colors.warning, bg: 'rgba(251,188,4,0.12)' },
  closed: { label: '이용 불가', color: colors.danger, bg: 'rgba(234,67,53,0.12)' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
