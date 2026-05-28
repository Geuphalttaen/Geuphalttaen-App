// 화장실 상세 화면
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FacilityIcon } from '@/src/features/toilets/components/FacilityIcon';
import { StatusBadge } from '@/src/features/toilets/components/StatusBadge';
import { useToiletDetail } from '@/src/features/toilets/hooks/useToiletDetail';
import { useAuthStore } from '@/src/features/auth/store';
import { formatDistance } from '@/src/shared/lib/formatDistance';
import { colors } from '@/src/shared/theme';
import { ReviewSection } from '@/src/features/reviews/components/ReviewSection';
import { WriteReviewModal } from '@/src/features/reviews/components/WriteReviewModal';
import { useMyReview } from '@/src/features/reviews/hooks/useMyReview';

interface FacilityCardProps {
  type: 'male' | 'female' | 'disabled' | 'familyRoom';
  label: string;
  available: boolean;
}

function FacilityCard({ type, label, available }: FacilityCardProps) {
  return (
    <View style={[styles.facilityCard, !available && styles.facilityCardUnavailable]}>
      <FacilityIcon type={type} available={available} size={40} />
      <Text style={[styles.facilityLabel, !available && styles.facilityLabelUnavailable]}>
        {label}
      </Text>
      {!available && <Text style={styles.facilityNoneLabel}>없음</Text>}
    </View>
  );
}

export default function DetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const toiletId = Number(id);
  const { toilet, isLoading, error, refetch } = useToiletDetail(toiletId);
  const { isAuthenticated } = useAuthStore();
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const { myReview, myCleanliness } = useMyReview(toiletId);

  const handleBack = () => router.back();

  const handleWriteReview = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    setReviewModalVisible(true);
  }, [isAuthenticated, router]);

  const handleNavigate = useCallback(() => {
    if (!toilet) return;
    const name = encodeURIComponent(toilet.name);
    const url = `https://map.naver.com/v5/directions/-/${toilet.lng},${toilet.lat},${name}/-/walk?c=${toilet.lng},${toilet.lat},15,0,0,0,dh`;
    void WebBrowser.openBrowserAsync(url);
  }, [toilet]);

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !toilet) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error?.message ?? '정보를 불러올 수 없습니다'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryBtnText}>다시 시도</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={handleBack}>
          <Text style={styles.backLinkText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const distance = formatDistance(toilet.distanceMeters);

  return (
    <View style={styles.container}>
      {/* 네비게이션 바 */}
      <View style={[styles.navBar, { top: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={handleBack}
          accessibilityLabel="뒤로 가기"
        >
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
      </View>

      {/* 스크롤 콘텐츠 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 96 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 히어로 섹션 */}
        <View style={styles.heroSection}>
          <View style={styles.heroStatusRow}>
            <StatusBadge status="open" />
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{toilet.isPublic ? '공공' : '제보됨'}</Text>
            </View>
          </View>
          <Text style={styles.heroName}>{toilet.name}</Text>
          <View style={styles.heroAddressRow}>
            <Text style={styles.heroAddress}>{toilet.address}</Text>
            {toilet.distanceMeters !== null && (
              <>
                <View style={styles.addressDot} />
                <Text style={styles.heroDistance}>{distance}</Text>
              </>
            )}
          </View>
        </View>

        {/* 시설 정보 */}
        <View style={styles.section}>
          <View style={styles.facilitiesGrid}>
            <FacilityCard type="male" label="남성용" available={toilet.male} />
            <FacilityCard type="female" label="여성용" available={toilet.female} />
            <FacilityCard type="disabled" label="장애인" available={toilet.disabled} />
            <FacilityCard type="familyRoom" label="가족실" available={toilet.familyRoom} />
          </View>
        </View>

        {/* 리뷰 */}
        <View style={styles.reviewSection}>
          <ReviewSection toiletId={toiletId} />
        </View>
      </ScrollView>

      <WriteReviewModal
        visible={reviewModalVisible}
        toiletId={toiletId}
        initialReview={myReview}
        initialCleanlinessScore={myCleanliness?.score}
        onClose={() => setReviewModalVisible(false)}
        onSuccess={() => setReviewModalVisible(false)}
      />

      {/* 하단 CTA */}
      <View style={[styles.bottomCta, { paddingBottom: insets.bottom + 14 }]}>
        <TouchableOpacity
          style={styles.ctaBtnSecondary}
          accessibilityLabel="길찾기"
          onPress={handleNavigate}
        >
          <Text style={styles.ctaBtnSecondaryText}>↗ 길찾기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ctaBtn}
          accessibilityLabel={myReview ? '리뷰 수정하기' : '리뷰 작성하기'}
          onPress={handleWriteReview}
        >
          <Text style={styles.ctaBtnText}>{myReview ? '★ 리뷰 수정하기' : '★ 리뷰 작성하기'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.bg,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retryBtn: {
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
  backLink: {
    marginTop: 8,
  },
  backLinkText: {
    fontSize: 14,
    color: colors.text2,
  },
  navBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  navBtnText: {
    fontSize: 24,
    color: colors.text1,
    lineHeight: 28,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  heroStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  heroName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text1,
    letterSpacing: -0.7,
    lineHeight: 34,
  },
  heroAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  heroAddress: {
    fontSize: 13,
    color: colors.text2,
    letterSpacing: -0.2,
  },
  addressDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.text3,
  },
  heroDistance: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  facilityCard: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  facilityCardUnavailable: {
    backgroundColor: colors.surface,
    borderColor: 'transparent',
  },
  facilityLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text1,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  facilityLabelUnavailable: {
    color: colors.text3,
  },
  facilityNoneLabel: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 9,
    fontWeight: '600',
    color: colors.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  reviewSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaBtnSecondary: {
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  ctaBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.3,
  },
});
