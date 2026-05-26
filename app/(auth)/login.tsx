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
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { colors } from '@/src/shared/theme';
import { login as kakaoLogin } from '@react-native-seoul/kakao-login';

function KakaoMark({ size = 21 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.477 2 2 5.925 2 10.76c0 3.026 1.864 5.683 4.69 7.228L5.5 22l3.75-2.01c.886.157 1.79.24 2.75.24 5.523 0 10-3.924 10-8.76C22 5.925 17.523 2 12 2z"
        fill="rgba(25,12,0,0.88)"
      />
    </Svg>
  );
}

function AppleMark({ size = 21 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
        fill="white"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { loginWithKakao, loginWithApple } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleKakaoLogin = useCallback(async () => {
    try {
      setIsLoading(true);
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
        {/* 카카오 로그인 */}
        <TouchableOpacity
          style={styles.kakaoBtn}
          onPress={handleKakaoLogin}
          disabled={isLoading}
          accessibilityLabel="카카오로 시작하기"
        >
          <View style={styles.btnIconWrap}>
            <KakaoMark size={21} />
          </View>
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
            <View style={styles.btnIconWrap}>
              <AppleMark size={21} />
            </View>
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
  btnIconWrap: {
    position: 'absolute',
    left: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    position: 'relative',
  },
  appleBtnText: {
    fontSize: 16,
    fontWeight: '700',
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
