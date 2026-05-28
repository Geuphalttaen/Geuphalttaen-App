# 급할땐 — App

외출 중 가장 가까운 공중화장실을 빠르게 찾아주는 모바일 앱

## 주요 기능

- 현재 위치 기반 근처 공중화장실 지도 조회 (비로그인)
- 비공용 화장실 위치 제보 (로그인, 관리자 승인 후 노출)
- 화장실 상세 정보 + 리뷰 / 청결도 평가
- 길 안내 (네이버 지도 / 카카오맵 / 애플 지도)
- Kakao / Apple OAuth2 로그인
- 닉네임 설정 및 마이페이지 (내 제보 목록, 회원 탈퇴)

## 기술 스택

| 구분 | 기술 |
|------|------|
| 플랫폼 | Expo SDK 53 (React Native + TypeScript) |
| 라우팅 | Expo Router v4 |
| 서버 상태 | TanStack Query v5 |
| 클라이언트 상태 | Zustand |
| 지도 | react-native-maps |
| 위치 | expo-location |
| 인증 | Kakao OAuth2, Apple Sign In (expo-apple-authentication) |
| 토큰 저장 | expo-secure-store |
| 유효성 검사 | zod |
| HTTP 클라이언트 | axios |
| 테스트 | Jest + jest-expo, @testing-library/react-native |
| 패키지 매니저 | pnpm |

## 시작하기

### 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local`에 필요한 값 입력:

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY=...
EXPO_PUBLIC_NAVER_CLIENT_ID=...
```

### 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
npx expo start

# iOS 시뮬레이터
npx expo start --ios

# Android 에뮬레이터
npx expo start --android
```

### 타입 체크 / 테스트

```bash
npx tsc --noEmit
npx jest
```

## 디렉토리 구조

```
app/
  (app)/          — 인증 후 화면 (지도, 목록, 상세, 제보, 마이페이지)
  (auth)/         — 로그인 화면
src/
  features/
    auth/         — OAuth 로그인, 토큰 관리
    map/          — 지도, 위치, 화장실 마커
    reviews/      — 리뷰 / 청결도 작성·수정
    toilets/      — 화장실 상세 조회
    user/         — 프로필, 닉네임, 계정 관리
  shared/
    lib/          — axios 클라이언트, 포맷 유틸
    theme/        — 색상, 타이포그래피, 간격
```

## 백엔드

[geuphalttaen-server](../geuphalttaen-server) — Spring Boot 3 + Kotlin
