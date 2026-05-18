# 급할땐 (Geuphalttaen) — App

공중화장실 찾기 앱의 모바일 클라이언트입니다.

## 기술 스택

- Expo (React Native + TypeScript)
- React Query (TanStack Query) — 서버 상태 관리
- Zustand — 클라이언트 상태 (인증 등)
- react-native-maps — 지도
- expo-location — 현재 위치
- Kakao / Apple OAuth

## 디렉토리 구조 (예정)

```
src/
  api/          — API 클라이언트
  components/   — 공통 컴포넌트
  screens/      — 화면
  store/        — Zustand 스토어
  hooks/        — 커스텀 훅
  theme/        — 디자인 토큰
```

## 주요 기능

- 비로그인: 현재 위치 기반 근처 화장실 지도 조회
- 로그인 (Kakao/Apple): 화장실 위치 제보

## 실행

```bash
npx expo start
```
