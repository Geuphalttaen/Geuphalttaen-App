// 마이페이지 화면
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useMyProfile } from '@/src/features/user/api';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { NicknameModal } from '@/src/features/user/NicknameModal';
import { colors } from '@/src/shared/theme';

const ChevronRight = () => (
  <View style={styles.chevron}>
    <View style={[styles.chevronArm, styles.chevronTop]} />
    <View style={[styles.chevronArm, styles.chevronBottom]} />
  </View>
);

interface RowProps {
  label: string;
  value?: string;
  showChevron?: boolean;
  danger?: boolean;
  first?: boolean;
  last?: boolean;
  onPress?: () => void;
}

const Row = ({ label, value, showChevron = true, danger, first, last, onPress }: RowProps) => (
  <TouchableOpacity
    style={[
      styles.row,
      first && styles.rowFirst,
      last && styles.rowLast,
      !last && styles.rowBorder,
    ]}
    onPress={onPress}
    activeOpacity={onPress ? 0.6 : 1}
    disabled={!onPress}
  >
    <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
    {value !== undefined && <Text style={styles.rowValue}>{value}</Text>}
    {showChevron && !value && !danger && <ChevronRight />}
  </TouchableOpacity>
);

export default function MyPageScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const { data: profile, isLoading } = useMyProfile();

  const [nicknameModalVisible, setNicknameModalVisible] = useState(false);
  const avatarChar = profile?.nickname?.charAt(0) ?? '?';
  const isKakao = profile?.provider === 'KAKAO';

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

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
        <Text style={styles.topBarTitle}>마이페이지</Text>
        <View style={styles.topBarRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* 프로필 카드 */}
            <View style={styles.profileCard}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{avatarChar}</Text>
                </View>
                {/* 소셜 배지 */}
                <View style={[styles.providerBadge, isKakao && styles.providerBadgeKakao]}>
                  <Text style={[styles.providerBadgeText, isKakao && styles.providerBadgeTextKakao]}>
                    {isKakao ? 'K' : 'A'}
                  </Text>
                </View>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.nickname}>{profile?.nickname ?? '-'}</Text>
                <View style={styles.providerRow}>
                  <View style={[styles.providerTag, isKakao && styles.providerTagKakao]}>
                    <Text style={[styles.providerTagText, isKakao && styles.providerTagTextKakao]}>
                      {isKakao ? 'KAKAO' : 'APPLE'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 통계 행 */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={[styles.statNum, styles.statNumAccent]}>
                  {profile?.reportCount ?? 0}
                </Text>
                <Text style={styles.statLabel}>내 제보</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>{profile?.postedCount ?? 0}</Text>
                <Text style={styles.statLabel}>게시됨</Text>
              </View>
            </View>

            {/* 활동 섹션 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>활동</Text>
              <View style={styles.sectionCard}>
                <Row
                  label="내 제보 목록"
                  first
                  onPress={() => router.push('/(app)/my-reports')}
                />
                <Row label="저장한 화장실" value="준비 중" showChevron={false} />
                <Row label="작성한 리뷰" value="준비 중" showChevron={false} last />
              </View>
            </View>

            {/* 설정 섹션 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>설정</Text>
              <View style={styles.sectionCard}>
                <Row label="닉네임 변경" first onPress={() => setNicknameModalVisible(true)} />
                <Row label="이용 약관" onPress={() => { WebBrowser.openBrowserAsync('https://www.notion.so/366fbab2ef7381bebbdccbd0a33bcc2f').catch(() => Alert.alert('오류', '페이지를 열 수 없습니다')); }} />
                <Row label="개인정보 처리방침" onPress={() => { WebBrowser.openBrowserAsync('https://www.notion.so/366fbab2ef73816d8123d94d8b518f1e').catch(() => Alert.alert('오류', '페이지를 열 수 없습니다')); }} />
                <Row label="버전 정보" value="v1.0.0" showChevron={false} last />
              </View>
            </View>

            {/* 로그아웃 */}
            <View style={styles.logoutWrap}>
              <View style={styles.sectionCard}>
                <Row label="로그아웃" danger first last showChevron={false} onPress={() => { void handleLogout(); }} />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <NicknameModal
        visible={nicknameModalVisible}
        currentNickname={profile?.nickname}
        onClose={() => setNicknameModalVisible(false)}
      />
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
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  backIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArm: {
    position: 'absolute',
    width: 10,
    height: 2,
    backgroundColor: colors.text1,
    borderRadius: 1,
  },
  backTop: {
    transform: [{ rotate: '-45deg' }, { translateY: -3 }],
  },
  backBottom: {
    transform: [{ rotate: '45deg' }, { translateY: 3 }],
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text1,
    letterSpacing: -0.3,
  },
  topBarRight: { width: 40 },

  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  loadingWrap: {
    paddingTop: 80,
    alignItems: 'center',
  },

  // 프로필 카드
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -1,
    lineHeight: 34,
  },
  providerBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface2,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerBadgeKakao: {
    backgroundColor: colors.kakao,
  },
  providerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.text2,
  },
  providerBadgeTextKakao: {
    color: colors.kakaoText,
  },
  profileInfo: { flex: 1, minWidth: 0 },
  nickname: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text1,
    letterSpacing: -0.4,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  providerTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.surface2,
  },
  providerTagKakao: {
    backgroundColor: colors.kakao,
  },
  providerTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text2,
    letterSpacing: 0.3,
  },
  providerTagTextKakao: {
    color: colors.kakaoText,
  },

  // 통계
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text1,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  statNumAccent: {
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text2,
    marginTop: 6,
    letterSpacing: -0.1,
  },

  // 섹션
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text3,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    paddingHorizontal: 8,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutWrap: { marginTop: 8 },

  // 행
  row: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
  },
  rowFirst: { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  rowLast: { borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text1,
    letterSpacing: -0.3,
  },
  rowLabelDanger: { color: colors.danger },
  rowValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text3,
    letterSpacing: 0.2,
  },

  // 화살표
  chevron: {
    width: 8,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronArm: {
    position: 'absolute',
    width: 9,
    height: 1.8,
    backgroundColor: colors.text3,
    borderRadius: 1,
  },
  chevronTop: {
    transform: [{ rotate: '45deg' }, { translateY: -3 }],
  },
  chevronBottom: {
    transform: [{ rotate: '-45deg' }, { translateY: 3 }],
  },
});
