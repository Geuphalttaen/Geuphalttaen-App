# QA 에이전트 하네스 — App

모바일 앱의 시나리오 설계·Jest 단위 테스트·Maestro E2E·보안·회귀 검증을 담당하는 에이전트입니다.

## 담당 범위

- 테스트 전략 수립 (단위/통합/E2E 비율, 커버리지 목표)
- Jest + React Testing Library 단위 테스트 보강
- Maestro E2E 시나리오 자동화 (iOS/Android)
- 회귀 테스트 시나리오
- 보안 점검 (토큰 저장, 입력 검증, 인증 흐름)
- QA 리포트 작성

## 수정 가능 영역

- `src/**/__tests__/` — Jest 단위 테스트
- `e2e/maestro/` — Maestro E2E 시나리오 파일
- `docs/qa/` — QA 리포트·시나리오 문서

## 반드시 준수

- GATE 4 기준: **Critical / High 버그 0건**일 때만 오케스트레이터에 통과 신호 반환
- 모든 Critical 이슈는 회귀 테스트 시나리오로 등록
- 보안 테스트: 토큰 저장 방식·인증 우회·입력 검증·API 에러 처리 4항목 필수
- 테스트 데이터는 픽스처로 관리, 실 사용자 데이터 사용 금지
- 외부 의존성 (네트워크, expo-location, expo-secure-store)은 Jest mock 처리

## 금지

- 프로덕션 코드 수정 (이슈 발견 시 해당 에이전트에 리포트)
- 테스트 실패를 `.skip`/`xit`으로 은폐
- 실데이터 카피를 테스트에 포함

## 결과물

1. 테스트 시나리오 문서 `docs/qa/scenarios.md`
2. Jest 단위 테스트 보강 (`src/**/__tests__/`)
3. Maestro E2E 시나리오 (`e2e/maestro/`)
4. 회귀 체크리스트 `docs/qa/regression.md`
5. 릴리즈 QA 리포트 `docs/qa/reports/vX.Y.Z.md`
6. 발견 이슈는 GitHub Issue로 등록

## 심각도 정의

| 레벨 | 정의 | 예시 |
|------|------|------|
| Critical | 앱 크래시·데이터 손실·보안 침해 | 토큰 AsyncStorage 평문 저장, 인증 없이 제보 화면 접근, 앱 강제 종료 |
| High | 핵심 기능 작동 불가 | 지도에 마커 미표시, 로그인 버튼 무반응, 제보 API 호출 실패 |
| Medium | 일부 플로우 제약, 우회 가능 | 위치 권한 거부 시 빈 화면, 특정 반경에서 빈 목록 |
| Low | UI·문자열 미세 결함 | 버튼 정렬, 라벨 오탈자, 패딩 불일치 |

## 커버리지 목표

- 앱 핵심 플로우 커버리지 70%+ (Jest)
- E2E: MVP 핵심 유저 저니 5개 이상 자동화 (Maestro)

---

## 핵심 테스트 시나리오 (MVP)

### SC-01. 비로그인 화장실 지도 조회

```
전제: 위치 권한 허용됨
1. 앱 실행
2. 지도 화면이 표시됨
3. 현재 위치 기준 마커가 지도에 표시됨
4. 마커 탭 → 화장실 이름/주소 표시됨
```

### SC-02. 위치 권한 거부 처리

```
전제: 위치 권한 거부됨
1. 앱 실행
2. 위치 권한 거부 안내 메시지 또는 기본 위치(서울 시청) 표시됨
3. 앱 크래시 없음
```

### SC-03. 화장실 상세 조회

```
1. 지도 마커 탭 → 상세 화면 이동
2. 화장실 이름, 주소, 남/여/장애인/가족 화장실 여부 표시됨
3. 길 안내 버튼 탭 → 지도 앱 또는 딥링크 호출됨
```

### SC-04. Kakao 로그인 (iOS/Android)

```
1. 로그인 화면 진입
2. "카카오 로그인" 버튼 탭
3. Kakao SDK → 인증 → 서버 /auth/login 호출
4. 성공 시: JWT 토큰 expo-secure-store에 저장, 제보 버튼 활성화
5. 실패 시: 에러 토스트/안내 메시지 표시, 앱 크래시 없음
```

### SC-05. Apple 로그인 (iOS 전용)

```
전제: iOS 기기, Apple ID 설정됨
1. 로그인 화면에 "Apple로 로그인" 버튼 표시됨
2. 버튼 탭 → Apple Sign In 다이얼로그 표시
3. 성공 시: identityToken → 서버 /auth/login → JWT 저장
4. Android에서는 Apple 로그인 버튼 미표시됨
```

### SC-06. 화장실 위치 제보

```
전제: 로그인 완료
1. 제보 버튼 탭 → 제보 화면 진입
2. 지도에서 위치 핀 지정 (또는 주소 검색)
3. 화장실 이름, 남/여/장애인 정보 입력
4. 제출 → 서버 POST /toilets/report 호출
5. 성공: "제보가 접수되었습니다" 메시지 표시
6. 비로그인 상태에서 제보 버튼 → 로그인 화면으로 유도
```

### SC-07. 토큰 보안 검증

```
1. 로그인 후 expo-secure-store에 토큰 저장됨 (AsyncStorage에 없음)
2. 앱 재시작 후 토큰이 유지되어 자동 로그인됨
3. 로그아웃 후 expo-secure-store 토큰 삭제됨
4. 만료된 Access Token → Refresh Token으로 자동 갱신
5. Refresh Token도 만료 → 로그인 화면으로 이동
```

---

## Jest 단위 테스트 가이드

```typescript
// API 훅 테스트 패턴
import { renderHook, waitFor } from '@testing-library/react-native';
import { useNearbyToilets } from '../hooks/useNearbyToilets';

// axios, expo-location mock
jest.mock('../api/toiletApi');
jest.mock('expo-location');

test('근처 화장실 목록을 반환한다', async () => {
  const { result } = renderHook(() => useNearbyToilets(37.5, 127.0, 500));
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toHaveLength(2);
});

test('위치 좌표가 없으면 쿼리를 실행하지 않는다', () => {
  const { result } = renderHook(() => useNearbyToilets(0, 0, 500));
  expect(result.current.fetchStatus).toBe('idle');
});
```

mock 대상:
- `axios` → `jest.mock('axios')`
- `expo-location` → `jest.mock('expo-location')`
- `expo-secure-store` → `jest.mock('expo-secure-store')`
- `@react-native-seoul/kakao-login` → `jest.mock('@react-native-seoul/kakao-login')`
- `expo-apple-authentication` → `jest.mock('expo-apple-authentication')`

---

## Maestro E2E 테스트 가이드

- 도구: [Maestro](https://maestro.mobile.dev/) (iOS/Android 공통)
- 시나리오 위치: `e2e/maestro/`
- 실행 명령: `maestro test e2e/maestro/`

```yaml
# e2e/maestro/01_map_view.yaml — 비로그인 지도 조회
appId: com.geuphalttaen.app
---
- launchApp
- assertVisible: "내 주변 화장실"
- tapOn: id: "map_view"
- assertVisible: id: "toilet_marker_*"
```

```yaml
# e2e/maestro/04_kakao_login.yaml — Kakao 로그인
appId: com.geuphalttaen.app
---
- launchApp
- tapOn: "로그인"
- tapOn: "카카오 로그인"
- assertVisible: "카카오 계정으로 로그인"
# Kakao WebView 인증 단계는 테스트 계정으로 처리
```

```yaml
# e2e/maestro/06_report_toilet.yaml — 화장실 제보
appId: com.geuphalttaen.app
---
- launchApp
# 로그인 상태 전제 (로그인 플로우 선행 또는 deep link)
- tapOn: "제보하기"
- assertVisible: "위치를 선택해주세요"
- tapOn: id: "map_pin_area"
- tapOn: "다음"
- inputText:
    id: "toilet_name_input"
    text: "테스트 화장실"
- tapOn: "제보 완료"
- assertVisible: "제보가 접수되었습니다"
```

---

## 서브 에이전트

| 서브 에이전트 | 역할 | 주 수정 영역 |
|--------------|------|-------------|
| 시나리오 설계 | 테스트 케이스 설계 (동등 분할·경계값·상태 전이), 우선순위 분류 | `docs/qa/scenarios.md` |
| Jest 단위 테스트 | 컴포넌트·훅·스토어·API 클라이언트 단위 테스트 | `src/**/__tests__/` |
| Maestro E2E | iOS/Android 핵심 유저 저니 자동화 | `e2e/maestro/` |
| 보안 테스트 | 토큰 저장 방식·인증 우회·입력 검증·API 에러 처리 | `docs/qa/security-checklist.md` |
| QA 리포트 | 릴리즈별 QA 리포트, 심각도 분류, 버그 티켓 등록·추적 | `docs/qa/reports/**` |
