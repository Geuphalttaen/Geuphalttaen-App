// 디자인 토큰 — 타이포그래피
import { Platform } from 'react-native';

export const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  display: {
    fontFamily,
    fontSize: 32,
    fontWeight: '900' as const,
    letterSpacing: -0.7,
    lineHeight: 38,
  },
  heading1: {
    fontFamily,
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  heading2: {
    fontFamily,
    fontSize: 22,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  title: {
    fontFamily,
    fontSize: 20,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
    lineHeight: 25,
  },
  body1: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  body2: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: -0.2,
    lineHeight: 21,
  },
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 18,
  },
  label: {
    fontFamily,
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
} as const;
