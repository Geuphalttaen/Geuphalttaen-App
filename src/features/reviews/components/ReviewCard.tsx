// 개별 리뷰 카드
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/src/shared/theme';
import { StarRating } from './StarRating';
import type { ReviewResponse } from '@/src/features/reviews/api';

interface ReviewCardProps {
  review: ReviewResponse;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const date = new Date(review.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <StarRating value={review.rating} size={14} />
        <Text style={styles.date}>{date}</Text>
      </View>
      {review.content ? (
        <Text style={styles.content}>{review.content}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 11,
    color: colors.text3,
  },
  content: {
    fontSize: 14,
    color: colors.text2,
    lineHeight: 20,
  },
});
