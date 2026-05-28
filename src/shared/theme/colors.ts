// 디자인 토큰 — 색상
const WHITE = '#FFFFFF';

export const colors = {
  primary: '#1A73E8',
  primary12: 'rgba(26,115,232,0.12)',
  primary08: 'rgba(26,115,232,0.08)',
  success: '#34A853',
  warning: '#FBBC04',
  danger: '#EA4335',
  bg: WHITE,
  surface: '#F8F9FA',
  surface2: '#F1F3F4',
  text1: '#202124',
  text2: '#5F6368',
  text3: '#80868B',
  border: 'rgba(0,0,0,0.08)',
  borderStrong: 'rgba(0,0,0,0.14)',
  ink: '#0B0D12',
  white: WHITE,
  black: '#000000',
  kakao: '#FEE500',
  kakaoText: '#191600',
} as const;

export type Colors = typeof colors;
