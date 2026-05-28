# 프론트엔드 에이전트 하네스

Expo React Native 기반 모바일 앱 UI를 구현하는 에이전트입니다.

## 담당 범위

- `src/screens/` — 화면 컴포넌트 전체
- `src/components/` — 공통 UI 컴포넌트
- `src/api/` — API 클라이언트·zod 스키마·React Query 훅
- `src/store/` — Zustand 스토어 (인증 상태 등)
- `src/hooks/` — 커스텀 훅
- `src/theme/` — 디자인 토큰 (colors, spacing, typography)
- `App.tsx`, `index.ts` — 진입점·네비게이션 설정

백엔드 코드 (`geuphalttaen-server/`) 수정 금지.

## 기술 스택

- TypeScript (strict 모드)
- Expo (React Native), React Navigation
- React Query (TanStack Query) — 서버 상태 관리
- Zustand — 클라이언트 상태 (인증 토큰 등)
- react-native-maps — 지도 렌더링, 마커 표시
- expo-location — 현재 위치 권한 요청 및 좌표 획득
- expo-secure-store — JWT 토큰 안전 저장 (Keychain/Keystore)
- zod — API 응답 런타임 검증
- Jest, React Testing Library — 단위 테스트

## 반드시 준수

- TypeScript strict 유지, `any` 사용 금지 (필요 시 `unknown` + 타입 가드)
- API 응답은 **zod 스키마로 런타임 검증** 후 타입 사용
- 서버 상태는 React Query, 로컬 UI 상태는 Zustand 또는 `useState`
- **보안 토큰은 반드시 `expo-secure-store` 경유** — AsyncStorage에 평문 저장 절대 금지
- 모든 API 호출에 에러 바운더리·로딩·빈 상태 3종 처리
- 스타일: React Native StyleSheet 사용, 인라인 스타일 지양
- 위치 권한 요청 전 사용자에게 목적 설명 (UX 필수)
- 지도 마커 렌더링 시 데이터 개수 제한 고려 (대량 마커 성능 이슈 방지)
- 모든 커밋 전 `npx tsc --noEmit && npm test` 통과

## react-native-maps 가이드

- `MapView`에 `showsUserLocation={true}`, `followsUserLocation={false}` 설정
- 마커 클러스터링: 반경 조회 결과가 50개 초과 시 클러스터링 적용 고려
- 지도 초기 region은 `expo-location`으로 획득한 현재 위치 기반
- Android: `PROVIDER_GOOGLE` 사용, Google Maps API 키 환경 변수 관리 (`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`)
- iOS: 기본 Apple Maps 사용 가능, Google Maps 사용 시 동일 키 필요

```typescript
// 위치 권한 + 현재 위치 패턴
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  // 권한 거부 처리 — 기본 위치(서울 시청)로 폴백
}
const location = await Location.getCurrentPositionAsync({});
```

## expo-location 가이드

- 권한: `Location.requestForegroundPermissionsAsync()` — 앱 진입 시 1회
- 정확도: `Location.Accuracy.Balanced` (배터리·정확도 균형)
- 위치 캐싱: React Query staleTime 30초 권장 (잦은 GPS 호출 방지)

## Kakao / Apple 인증 가이드

### Kakao OAuth

- 라이브러리: `@react-native-seoul/kakao-login`
- 플로우: `login()` → kakao accessToken 획득 → 서버 `POST /api/v1/auth/login { provider: "KAKAO", accessToken }` → 서버 JWT 수신
- Kakao App Key: 환경 변수 관리 (`EXPO_PUBLIC_KAKAO_APP_KEY`)

### Apple Sign In

- 라이브러리: `expo-apple-authentication`
- 플로우: `signInAsync()` → identityToken 획득 → 서버 `POST /api/v1/auth/login { provider: "APPLE", accessToken: identityToken }` → 서버 JWT 수신
- iOS 전용 기능 — Android에서는 Kakao 로그인만 표시

```typescript
// Apple 로그인 패턴
const credential = await AppleAuthentication.signInAsync({
  requestedScopes: [
    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    AppleAuthentication.AppleAuthenticationScope.EMAIL,
  ],
});
// credential.identityToken 을 서버로 전달
```

## 금지

- 백엔드 코드 수정 (API 계약 변경이 필요하면 백엔드 에이전트에 요청)
- `expo-secure-store` 대신 AsyncStorage에 JWT 저장
- 하드코딩된 API URL (환경 변수 `EXPO_PUBLIC_API_BASE_URL` 사용)
- TypeScript strict 설정 완화 (`tsconfig.json` 변경 금지)
- 패키지 버전 무작위 업그레이드 (PR로 별도 진행)

## 결과물 (Deliverable)

1. 기능별 화면 컴포넌트 + Jest 단위 테스트
2. PR 본문에 스크린샷 또는 시뮬레이터 영상 첨부
3. 신규 환경 변수 추가 시 `.env.example` 갱신

## 주요 화면 (MVP)

```
src/screens/
  MapScreen/         — 지도 메인 (react-native-maps + 마커 + 현재 위치)
  ListScreen/        — 거리순 화장실 목록
  DetailScreen/      — 화장실 상세 정보 + 길 안내
  AuthScreen/        — Kakao/Apple 로그인 버튼
  ReportScreen/      — 화장실 제보 (지도 핀 지정 + 폼)
```

## React Query 패턴

```typescript
// API 훅 패턴
export function useNearbyToilets(lat: number, lng: number, radiusMeters: number) {
  return useQuery({
    queryKey: ['toilets', 'nearby', lat, lng, radiusMeters],
    queryFn: () => fetchNearbyToilets({ lat, lng, radiusMeters }),
    staleTime: 30_000, // 30초
    enabled: !!lat && !!lng,
  });
}

// 제보 뮤테이션 패턴
export function useReportToilet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportToilet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toilets'] });
    },
  });
}
```

## Zustand 인증 스토어 패턴

```typescript
interface AuthStore {
  accessToken: string | null;
  isLoggedIn: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  logout: () => Promise<void>;
}
```

- `login`: 토큰을 `expo-secure-store`에 저장 + 스토어 상태 업데이트
- `logout`: `expo-secure-store` 토큰 삭제 + 스토어 초기화 + 서버 로그아웃 API 호출

## 서브 에이전트

| 서브 에이전트 | 역할 | 주 수정 영역 |
|--------------|------|-------------|
| 코드 분석가 | 기존 컴포넌트·스토어·훅 구조 파악, 유사 UI 탐색, 변경 영향도 조사 | (읽기 전용) |
| 화면 구현 | 화면 컴포넌트·네비게이션·제스처 | `src/screens/`, `src/components/` |
| 지도·위치 연동 | react-native-maps·expo-location·마커 | `src/screens/MapScreen`, `src/hooks/useLocation` |
| 인증 구현 | Kakao/Apple OAuth·토큰 저장·Zustand 스토어 | `src/screens/AuthScreen`, `src/store/authStore` |
| API·상태 연동 | React Query 훅·zod 스키마·axios 인터셉터 | `src/api/`, `src/hooks/` |
| 테스트 | Jest·React Testing Library·Maestro 시나리오 | `src/**/__tests__/`, `e2e/maestro/` |
| 코드 품질 | ESLint·Prettier·TS strict·번들 사이즈 | 설정 파일 |
