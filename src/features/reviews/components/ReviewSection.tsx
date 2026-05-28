// 리뷰 섹션 — 목록
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/src/shared/theme';
import { useReviews } from '@/src/features/reviews/hooks/useReviews';
import { ReviewCard } from './ReviewCard';

interface ReviewSectionProps {
  toiletId: number;
}

export function ReviewSection({ toiletId }: ReviewSectionProps) {
  const { page, isLoading, error } = useReviews(toiletId);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>리뷰를 불러오지 못했습니다.{'\n'}잠시 후 다시 시도해 주세요.</Text>
      </View>
    );
  }

  const reviews = page?.content ?? [];
  const total = page?.totalElements ?? 0;

  if (reviews.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>아직 리뷰가 없습니다.{'\n'}첫 번째 리뷰를 남겨보세요!</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.totalCount}>리뷰 {total}개</Text>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  empty: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.text2,
    textAlign: 'center',
    lineHeight: 22,
  },
  totalCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text3,
    marginBottom: 4,
  },
});
