// 리뷰 섹션 — 목록 + 평균 별점
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/src/shared/theme';
import { useReviews } from '@/src/features/reviews/hooks/useReviews';
import { ReviewCard } from './ReviewCard';
import { StarRating } from './StarRating';

interface ReviewSectionProps {
  toiletId: number;
}

export function ReviewSection({ toiletId }: ReviewSectionProps) {
  const { page, isLoading } = useReviews(toiletId);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  const reviews = page?.content ?? [];
  const total = page?.totalElements ?? 0;

  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  if (reviews.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>아직 리뷰가 없습니다.{'\n'}첫 번째 리뷰를 남겨보세요!</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.summary}>
        <Text style={styles.avgScore}>{avgRating}</Text>
        <StarRating value={Math.round(avgRating)} size={18} />
        <Text style={styles.totalCount}>리뷰 {total}개</Text>
      </View>
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
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 4,
  },
  avgScore: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text1,
    letterSpacing: -0.5,
  },
  totalCount: {
    fontSize: 12,
    color: colors.text3,
    marginLeft: 4,
  },
});
