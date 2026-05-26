// 별점 컴포넌트 — 읽기 전용(display) / 입력(interactive) 겸용
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '@/src/shared/theme';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

export function StarRating({ value, onChange, size = 24 }: StarRatingProps) {
  const isInteractive = onChange !== undefined;

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        if (isInteractive) {
          return (
            <TouchableOpacity key={star} onPress={() => onChange(star)} activeOpacity={0.7}>
              <Text style={[styles.star, { fontSize: size, color: filled ? colors.warning : colors.border }]}>
                ★
              </Text>
            </TouchableOpacity>
          );
        }
        return (
          <Text
            key={star}
            style={[styles.star, { fontSize: size, color: filled ? colors.warning : colors.border }]}
          >
            ★
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    lineHeight: undefined,
  },
});
