# use-hooks

[English](./README.md) | [한국어](./README.ko.md)

[![npm version](https://img.shields.io/npm/v/@jbpark/use-hooks.svg)](https://www.npmjs.com/package/@jbpark/use-hooks)
[![npm downloads](https://img.shields.io/npm/dm/@jbpark/use-hooks.svg)](https://www.npmjs.com/package/@jbpark/use-hooks)
[![GitHub issues](https://img.shields.io/github/issues/pjb0811/use-hooks)](https://github.com/pjb0811/use-hooks/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

일반적인 UI 및 상호작용 패턴을 위한 재사용 가능한 React 19 훅 모음입니다. TypeScript와 Vite로 빌드되었으며, 서버 사이드 렌더링과 클라이언트 사이드 애플리케이션 모두에 최적화되어 있습니다.

## 기능

- 📦 **13개 프로덕션 레디 훅** - 스크롤, 뷰포트, 스토리지 등 다양한 유틸리티
- 🎯 **TypeScript 지원** - 완전한 타입 지원으로 더 나은 개발 경험
- ⚡ **트리 셰이킹 지원** - 필요한 것만 임포트하세요
- 🔒 **SSR 안전** - window/document 전역 변수에 대한 보호
- 📱 **iOS 최적화** - 모바일 뷰포트 특성에 대한 특별 처리
- 🧹 **완벽한 정리** - 모든 리스너와 옵저버가 정리됩니다

## 설치

```bash
npm install @jbpark/use-hooks
```

또는 pnpm 사용:

```bash
pnpm add @jbpark/use-hooks
```

## 사용 방법

```tsx
import {
  useLocalStorage,
  useResponsiveSize,
  useThrottle,
  useWindowScroll,
} from '@jbpark/use-hooks';

function MyComponent() {
  // localStorage를 사용한 영속적 상태
  const [count, setCount] = useLocalStorage('count', 0);

  // 윈도우 스크롤 위치 추적
  const { y, percent } = useWindowScroll();

  // 브레이크포인트를 포함한 요소 크기 모니터링
  const { size, breakpoint, ref } = useResponsiveSize();

  // 너비 업데이트를 스로틀링
  const throttledWidth = useThrottle(size.width, 200);

  return (
    <div ref={ref}>
      <p>Count: {count}</p>
      <p>Scroll: {percent.y}%</p>
      <p>Breakpoint: {breakpoint.current}</p>
      <p>Throttled width: {throttledWidth}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
    </div>
  );
}
```

## 사용 가능한 훅

| 훅                    | 설명                                                            |
| --------------------- | --------------------------------------------------------------- |
| `useLocalStorage`     | 에러 핸들링이 포함된 JSON 기반 영속 상태 (SSR 안전)             |
| `useWindowScroll`     | 윈도우 스크롤 위치 및 백분율 추적 (iOS visualViewport 대응)     |
| `useElementScroll`    | ResizeObserver를 사용한 특정 요소의 스크롤 상태 추적            |
| `useElementPosition`  | 스크롤/리사이즈 시 요소의 바운딩 렉트 모니터링 (요소 참조 지원) |
| `useResponsiveSize`   | Tailwind 유사 브레이크포인트를 포함한 요소 크기 추적 (debounce) |
| `useBodyScrollLock`   | 스타일 보존을 포함한 바디 스크롤 잠금/해제 (iOS 특별 처리)      |
| `useClickOutside`     | 참조한 요소 바깥을 클릭/터치하면 콜백 실행                      |
| `useScrollToElements` | 인덱스별로 특정 요소로 스크롤 (오프셋 조절 가능)                |
| `useImage`            | 이미지 사전로드 및 로딩/에러 상태 노출                          |
| `useRecursiveTimeout` | 비동기/동기 콜백을 재귀적으로 스케줄링                          |
| `useViewport`         | visualViewport 지원, 인앱 모드 옵션, debounce 포함              |
| `useDebounce`         | 함수 실행을 지연해 과도한 업데이트를 방지 (autoInvoke 지원)     |
| `useThrottle`         | 값 업데이트를 일정 간격으로 제한                                |

## 개발

```bash
# HMR이 포함된 개발 서버 시작
pnpm dev

# 라이브러리 빌드 (tsc + vite)
pnpm build

# 빌드된 라이브러리 미리보기
pnpm preview

# 린트 및 타입 체크
pnpm lint

# prettier로 포맷팅
pnpm exec prettier --write .
```

## 프로젝트 구조

```
src/
├── hooks/                      # 개별 훅 구현 (훅 1개 = 파일 1개)
│   ├── use-body-scroll-lock.ts
│   ├── use-click-outside.ts
│   ├── use-debounce.ts
│   ├── use-element-position.ts
│   ├── use-element-scroll.ts
│   ├── use-image.ts
│   ├── use-local-storage.ts
│   ├── use-recursive-timeout.ts
│   ├── use-responsive-size.ts
│   ├── use-scroll-to-elements.ts
│   ├── use-throttle.ts
│   ├── use-viewport.ts
│   ├── use-window-scroll.ts
│   └── index.ts                # 배럴 익스포트
└── index.ts                    # 패키지 진입점

dist/                            # 빌드된 라이브러리 (ESM + types)
```

## 빌드 및 배포

이 프로젝트는 `develop` → `main` 브랜치 흐름과 AI 기반 자동 릴리스 노트를 사용합니다:

- **기능 브랜치**는 `develop`으로 머지됩니다.
- `develop`에 push될 때마다 워크플로가 diff를 분석해 `CHANGELOG.md`의 `## [Unreleased]` 섹션에 항목을 누적합니다 (버전은 아직 올리지 않음).
- `develop`이 `main`으로 머지되면 `Unreleased` 섹션에 버전+날짜가 확정되고 `package.json` 버전이 그에 맞춰 올라간 릴리스 PR이 생성됩니다.
- 이 릴리스 PR을 머지하면 빌드, npm 배포, 태그 생성까지 자동으로 진행됩니다.

라이브러리는 다음과 같이 빌드됩니다:

- **ES Module**: `dist/index.mjs`
- **타입 정의**: `dist/index.d.ts`

## 주요 패턴

- **훅 1개 = 파일 1개**: 각 훅은 `src/hooks/use-x.ts` 형태의 단일 파일로 존재하며 (폴더/`index.ts` 없음), `src/hooks/index.ts`에서 재수출됩니다
- **데모 파일 네이밍**: 각 훅의 데모 페이지 파일명은 훅 파일명에 `-demo`를 붙인 `src/demo/use-x-demo.tsx` 형태를 따릅니다 (컴포넌트명 자체는 기존처럼 PascalCase 유지, 예: `ClickOutsideDemo`)
- **Window 보호**: `window`/`document`에 접근하는 훅은 SSR 안전성을 위해 `typeof window` 체크 (예: `useLocalStorage`)
- **이벤트 리스너**: 모든 스크롤/리사이즈 리스너는 가능한 한 passive 플래그 사용
- **ResizeObserver**: `useResponsiveSize`와 `useElementPosition`에서 사용하여 성능 최적화
- **requestAnimationFrame**: 스크롤/리사이즈 콜백에서 레이아웃 스래싱 방지
- **iOS 대응**: `useBodyScrollLock`, `useWindowScroll`, `useViewport`에서 iOS의 visualViewport 특성 처리
- **Debounce**: `useResponsiveSize`와 `useViewport`에서 리사이즈 이벤트 디바운싱 지원

## 브라우저 지원

- 최신 브라우저 (Chrome, Firefox, Safari, Edge)
- iOS 12+ (특수한 `visualViewport` 처리 포함)
- SSR 준비 완료 (적절한 보호 포함)

## 기여하기

버그 리포트, 기능 제안, 또는 코드 기여를 환영합니다!

- 🐛 **버그 리포트**: [Issues](https://github.com/pjb0811/use-hooks/issues)에서 버그를 리포트해주세요
- 💡 **기능 제안**: 새로운 기능 아이디어가 있으시면 [Issues](https://github.com/pjb0811/use-hooks/issues)에 제안해주세요
- 🔧 **코드 기여**: Pull Request를 보내주시면 검토 후 반영하겠습니다

이슈를 생성하기 전에 기존 이슈를 확인해주시면 중복을 방지할 수 있습니다.

## 라이선스

MIT
