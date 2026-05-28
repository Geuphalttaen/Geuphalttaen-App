// 로그인 화면 — Kakao / Apple OAuth2
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { colors } from '@/src/shared/theme';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';
import KakaoLoginButton from '@/src/features/auth/components/KakaoLoginButton';
import AppleLoginButton from '@/src/features/auth/components/AppleLoginButton';
import { fetchMyProfile } from '@/src/features/user/api';
import { NicknameModal } from '@/src/features/user/NicknameModal';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { loginWithKakao, loginWithApple } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);

  const handleKakaoLogin = useCallback(async () => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      setIsLoading(true);
      // SDK가 취소 후 promise를 resolve/reject하지 않는 엣지케이스 대비 타임아웃
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('KAKAO_TIMEOUT')), 60_000);
      });
      const result = await Promise.race([kakaoLogin(), timeoutPromise]);
      clearTimeout(timeoutId);
      await loginWithKakao(result.accessToken);
      const profile = await fetchMyProfile();
      if (profile.nickname === '사용자') {
        setShowNicknameModal(true);
      } else {
        router.replace('/(app)');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'KAKAO_TIMEOUT') {
        // 타임아웃: 사용자가 이미 전환한 상태이므로 조용히 종료
        return;
      }
      // Kakao SDK는 취소 에러에 별도 code를 제공하지 않아 message 기반 감지
      // (Apple 로그인은 ERR_REQUEST_CANCELED code로 식별 가능한 것과 대비)
      const isCancel = msg.toLowerCase().includes('cancel') || msg.includes('취소');
      if (!isCancel) {
        Alert.alert('로그인 실패', msg || '카카오 로그인에 실패했습니다');
      }
    } finally {
      setIsLoading(false);
    }
  }, [loginWithKakao, router]);

  const handleAppleLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        throw new Error('Apple 인증 토큰을 가져올 수 없습니다');
      }
      await loginWithApple(credential.identityToken);
      const profile = await fetchMyProfile();
      if (profile.nickname === '사용자') {
        setShowNicknameModal(true);
      } else {
        router.replace('/(app)');
      }
    } catch (err) {
      if (err instanceof Error && (err as { code?: string }).code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      const message = err instanceof Error ? err.message : 'Apple 로그인에 실패했습니다';
      Alert.alert('로그인 실패', message);
    } finally {
      setIsLoading(false);
    }
  }, [loginWithApple, router]);

  const handleBrowse = useCallback(() => {
    router.replace('/(app)');
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* 브랜드 블록 */}
      <View style={styles.brandBlock}>
        <View style={styles.brandTile}>
          <Text style={styles.brandTileText}>급</Text>
          <View style={styles.brandTileDot} />
        </View>
        <View style={styles.wordmark}>
          <View style={styles.wordmarkRow}>
            <Text style={styles.wordmarkText}>급할땐</Text>
            <View style={styles.wordmarkDot} />
          </View>
          <Text style={styles.wordmarkSubtitle}>가장 가까운 공중화장실, 지금 바로</Text>
        </View>
      </View>

      {/* 로그인 버튼 영역 */}
      <View style={styles.authButtons}>
        <KakaoLoginButton onPress={handleKakaoLogin} disabled={isLoading} />
        <AppleLoginButton onPress={handleAppleLogin} disabled={isLoading} />
      </View>

      {/* 전체 화면 로딩 오버레이 */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
      )}

      {/* 비로그인 둘러보기 */}
      <TouchableOpacity
        style={styles.browseLink}
        onPress={handleBrowse}
        disabled={isLoading}
        accessibilityLabel="로그인 없이 둘러보기"
      >
        <Text style={styles.browseLinkText}>로그인 없이 둘러보기</Text>
      </TouchableOpacity>

      <NicknameModal
        visible={showNicknameModal}
        onClose={() => { setShowNicknameModal(false); router.replace('/(app)'); }}
        onSuccess={() => { setShowNicknameModal(false); router.replace('/(app)'); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBlock: {
    alignItems: 'center',
    gap: 24,
    marginBottom: 80,
  },
  brandTile: {
    width: 104,
    height: 104,
    borderRadius: 104 * 0.22,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 12,
  },
  brandTileText: {
    fontSize: 64,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: -4,
    lineHeight: 70,
  },
  brandTileDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: 2,
    marginBottom: 4,
  },
  wordmark: {
    alignItems: 'center',
    gap: 10,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  wordmarkText: {
    fontSize: 44,
    fontWeight: '900',
    color: colors.text1,
    letterSpacing: -44 * 0.055,
    lineHeight: 52,
  },
  wordmarkDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginBottom: 2,
  },
  wordmarkSubtitle: {
    fontSize: 14,
    color: colors.text2,
    letterSpacing: -0.3,
    fontWeight: '500',
  },
  authButtons: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  browseLink: {
    marginTop: 20,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
  },
  browseLinkText: {
    fontSize: 14,
    color: colors.text2,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
});
