# 급할땐 (Geuphalttaen) — App

이 파일은 Claude Code가 이 저장소의 코드를 다룰 때 참고하는 전역 안내서입니다.

## 프로젝트 개요

**급할땐**은 외출 중 가장 가까운 공중화장실을 빠르게 찾아주는 모바일 앱입니다.

- 비로그인 사용자: 현재 위치 기반 근처 공중화장실 지도 조회
- 로그인 사용자: 비공용 화장실 포함 위치 제보 (관리자 승인 후 노출)
- 인증 방식: Kakao / Apple OAuth2
- 백엔드 서버: `/Users/kwkang/Workspace/geuphalttaen-server/`
- 프로젝트 단계: **Phase 1 (MVP)** — 2026-05 ~

## 기술 스택

| 구분 | 기술 |
|------|------|
| 플랫폼 | Expo (React Native + TypeScript) |
| 서버 상태 | React Query (TanStack Query) |
| 클라이언트 상태 | Zustand (인증 토큰 등) |
| 지도 | react-native-maps |
| 위치 | expo-location |
| 인증 | Kakao OAuth2 SDK, Apple Sign In (`expo-apple-authentication`) |
| 토큰 저장 | expo-secure-store (Keychain/Keystore — 절대 AsyncStorage에 평문 저장 금지) |
| 유효성 검사 | zod |
| 테스트 | Jest, React Testing Library, Maestro (E2E) |

## 디렉토리 구조

```
src/
  api/          — API 클라이언트 (axios instance, endpoint 함수, zod 스키마)
  components/   — 공통 컴포넌트 (ToiletMarker, ToiletCard, BottomSheet 등)
  screens/      — 화면 컴포넌트 (MapScreen, DetailScreen, ReportScreen, AuthScreen 등)
  store/        — Zustand 스토어 (authStore 등)
  hooks/        — 커스텀 훅 (useNearbyToilets, useLocation, useAuth 등)
  theme/        — 디자인 토큰 (colors, spacing, typography)
e2e/
  maestro/      — Maestro E2E 시나리오 파일
```

## Git Convention

- **브랜치**: `feature/{기능}` / `fix/{버그}` / `refactor/{기능}` / `chore/{작업}`
- **커밋 타입**: `feat` / `fix` / `refactor` / `style` / `test` / `docs` / `chore`
- **흐름**: feature → develop (PR) → main (릴리즈)
- develop에 직접 push 금지 — 반드시 PR로 머지

## 주요 화면 목록

| 화면 | 설명 | 인증 |
|------|------|------|
| 지도 (MapScreen) | 현재 위치 기반 근처 화장실 마커 표시 | 불필요 |
| 목록 (ListScreen) | 거리순 화장실 목록 | 불필요 |
| 상세 (DetailScreen) | 화장실 상세 정보, 길 안내 버튼 | 불필요 |
| 로그인 (AuthScreen) | Kakao / Apple 로그인 버튼 | - |
| 제보 (ReportScreen) | 지도 핀 지정 + 정보 입력 | 필요 |

## 에이전트 위임 가이드

- **UI/화면/컴포넌트 관련** → `agents/frontend.md`
  - 화면·컴포넌트, 지도 연동, 상태 관리, API 연동
  - TypeScript strict 모드 유지, `any` 금지
- **QA/테스트** → `agents/qa.md`
  - 시나리오 체크리스트, Jest 단위 테스트, Maestro E2E
  - Critical/High 버그 0건 확인 후 오케스트레이터에게 결과 반환
- **코드 리뷰** → `agents/reviewer.md`
  - PR 생성 직후 자동 실행, 블로커 + 개선권고 처리

## AI 에이전트 오케스트레이션 파이프라인

```
/frontend시작
  → 화면 구현
    ├── PR 생성 즉시: reviewer 에이전트 + QA 에이전트 병렬 실행
    │     → gh pr comment <PR번호> --body "<리뷰 결과>"
    │     → 블로커/개선권고 수정 재커밋 시에도 즉시 재실행
    │     → 블로커 0건 + QA GATE 4 통과 → 유저에게 머지 요청
```

## GATE 승인 기준

| GATE | 조건 | 승인 방법 |
|------|------|------|
| GATE 4 (QA→완료) | Critical/High 버그 0건 | QA 에이전트 자동 판단 |
| **PR 리뷰 게이트** | 모든 PR에 reviewer 에이전트 리뷰 코멘트 1회 이상, 블로커 0건 | 유저가 머지 버튼 |

## 에이전트 구성

| 에이전트 | 파일 | 역할 |
|----------|------|------|
| 프론트엔드 | `agents/frontend.md` | 앱 화면·컴포넌트·상태관리·API 연동 구현 |
| QA | `agents/qa.md` | 시나리오, Jest 단위 테스트, Maestro E2E |
| 코드 리뷰 | `agents/reviewer.md` | PR 오픈 직후 독립 리뷰, 블로커 식별 |

## 코드 수정 및 테스트 규칙

### 필수 규칙

- 코드 수정 시 반드시 해당 기능의 단위 테스트를 작성하거나 기존 테스트를 실행
- TypeScript strict 모드 유지 (`tsconfig.json` 엄격 설정 변경 금지)
- API 응답은 zod 스키마로 런타임 검증 후 타입 사용
- 보안 토큰은 `expo-secure-store` 경유 — AsyncStorage 평문 저장 절대 금지
- 수정 명세서에 명시되지 않은 파일/함수는 수정하지 않음

## 코딩 언어

코드 주석·커밋 메시지의 기본 언어는 **한국어**

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npx expo start

# iOS 시뮬레이터
npx expo start --ios

# Android 에뮬레이터
npx expo start --android

# TypeScript 타입 체크
npx tsc --noEmit

# Jest 단위 테스트
npm test
```

## 보조 커맨드

| 커맨드 | 용도 |
|--------|------|
| `/frontend시작` | 앱 화면·컴포넌트 구현 |
| `/qa시작` | Jest 단위 테스트 + Maestro E2E 시나리오 |
| `/리뷰시작 <PR번호>` | PR 코드 리뷰 에이전트 호출 |
