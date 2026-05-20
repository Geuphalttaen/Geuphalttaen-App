// 로그인 화면 — Kakao / Apple OAuth2
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { colors } from '@/src/shared/theme';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { loginWithKakao, loginWithApple } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleKakaoLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      // 정적 임포트 — @react-native-seoul/kakao-login
      const result = await kakaoLogin();
      await loginWithKakao(result.accessToken);
      router.replace('/(app)');
    } catch (err) {
      const message = err instanceof Error ? err.message : '카카오 로그인에 실패했습니다';
      Alert.alert('로그인 실패', message);
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
      router.replace('/(app)');
    } catch (err) {
      if (err instanceof Error && (err as { code?: string }).code === 'ERR_REQUEST_CANCELED') {
        // 사용자가 취소한 경우 무시
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
        {/* 브랜드 타일 */}
        <View style={styles.brandTile}>
          <Text style={styles.brandTileText}>급</Text>
          <View style={styles.brandTileDot} />
        </View>

        {/* 워드마크 */}
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
        {/* 카카오 로그인 */}
        <TouchableOpacity
          style={styles.kakaoBtn}
          onPress={handleKakaoLogin}
          disabled={isLoading}
          accessibilityLabel="카카오로 시작하기"
        >
          <Text style={styles.kakaoBtnIcon}>K</Text>
          <Text style={styles.kakaoBtnText}>카카오로 시작하기</Text>
        </TouchableOpacity>

        {/* Apple 로그인 (iOS만) */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.appleBtn}
            onPress={handleAppleLogin}
            disabled={isLoading}
            accessibilityLabel="Apple로 계속하기"
          >
            <Text style={styles.appleBtnIcon}></Text>
            <Text style={styles.appleBtnText}>Apple로 계속하기</Text>
          </TouchableOpacity>
        )}

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
  kakaoBtn: {
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.kakao,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    position: 'relative',
  },
  kakaoBtnIcon: {
    position: 'absolute',
    left: 22,
    fontSize: 20,
    fontWeight: '900',
    color: colors.kakaoText,
  },
  kakaoBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.kakaoText,
    letterSpacing: -0.3,
  },
  appleBtn: {
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    position: 'relative',
  },
  appleBtnIcon: {
    position: 'absolute',
    left: 22,
    fontSize: 20,
    color: colors.white,
  },
  appleBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: -0.3,
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
