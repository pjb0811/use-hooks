# use-hooks

일반적인 UI 및 상호작용 패턴을 위한 재사용 가능한 React 19 훅 모음입니다. TypeScript와 Vite로 빌드되었으며, 서버 사이드 렌더링과 클라이언트 사이드 애플리케이션 모두에 최적화되어 있습니다.

## 기능

- 📦 **11+ 프로덕션 레디 훅** - 스크롤, 뷰포트, 스토리지 등 다양한 유틸리티
- 🎯 **TypeScript 지원** - 완전한 타입 지원으로 더 나은 개발 경험
- ⚡ **트리 셰이킹 지원** - 필요한 것만 임포트하세요
- 🔒 **SSR 안전** - window/document 전역 변수에 대한 보호
- 📱 **iOS 최적화** - 모바일 뷰포트 특성에 대한 특별 처리
- 🧹 **완벽한 정리** - 모든 리스너와 옵저버가 정리됩니다

## 설치

```bash
npm install @jax/use-hooks
```

## 사용 방법

```tsx
import {
  useElementSize,
  useLocalStorage,
  useWindowScroll,
} from '@jax/use-hooks';

function MyComponent() {
  // localStorage를 사용한 영속적 상태
  const [count, setCount] = useLocalStorage('count', 0);

  // 윈도우 스크롤 위치 추적
  const { y, percent } = useWindowScroll();

  // 브레이크포인트를 포함한 요소 크기 모니터링
  const { size, breakpoint, ref } = useElementSize();

  return (
    <div ref={ref}>
      <p>Count: {count}</p>
      <p>Scroll: {percent.y}%</p>
      <p>Breakpoint: {breakpoint.current}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

## 사용 가능한 훅

| 훅                    | 설명                                                 |
| --------------------- | ---------------------------------------------------- |
| `useLocalStorage`     | 에러 핸들링이 포함된 JSON 기반 영속 상태             |
| `useWindowScroll`     | 윈도우 스크롤 위치 및 백분율 추적 (iOS 대응)         |
| `useScrollPosition`   | ResizeObserver를 사용한 특정 요소의 스크롤 상태 추적 |
| `useElementRect`      | 스크롤/리사이즈 시 요소의 바운딩 렉트 모니터링       |
| `useElementSize`      | Tailwind 유사 브레이크포인트를 포함한 요소 크기 추적 |
| `useBodyScrollLock`   | 스타일 보존을 포함한 바디 스크롤 잠금/해제           |
| `useScrollBounceBack` | 임계값 초과 스크롤 방지 및 부드러운 스냅백           |
| `useScrollToElements` | 인덱스별로 특정 요소로 스크롤 (오프셋 조절 가능)     |
| `useImageLoader`      | 이미지 사전로드 및 로딩/에러 상태 노출               |
| `useRecursiveTimeout` | 비동기/동기 콜백을 재귀적으로 스케줄링               |
| `useViewport`         | 옵션 인앱 모드를 포함한 뷰포트 크기 추적             |

## 개발

```bash
# HMR이 포함된 개발 서버 시작
npm run dev

# 라이브러리 빌드 (tsc + vite)
npm run build

# 빌드된 라이브러리 미리보기
npm run preview

# 린트 및 타입 체크
npm run lint

# prettier로 포맷팅
npx prettier --write .
```

## 프로젝트 구조

```
src/
├── hooks/                 # 개별 훅 구현
│   ├── useLocalStorage/
│   ├── useWindowScroll/
│   ├── useScrollPosition/
│   └── ...
├── hooks/index.ts         # 배럴 익스포트
└── index.ts               # 패키지 진입점

dist/                       # 빌드된 라이브러리 (ES + CJS + types)
.changeset/                 # 버저닝을 위한 Changesets
```

## 빌드 및 배포

이 프로젝트는 버전 관리를 위해 Changesets를 사용합니다:

```bash
# 변경사항 기록
npx changeset

# 버전 업데이트 및 CHANGELOG 생성
npx changeset version

# npm에 배포
npx changeset publish

# 태그 푸시
git push --follow-tags
```

라이브러리는 다음과 같이 빌드됩니다:

- **ES Module**: `dist/index.js`
- **CommonJS**: `dist/index.cjs`
- **타입 정의**: `dist/index.d.ts`

## 주요 패턴

- **Window 보호**: `window`/`document`에 접근하는 훅은 SSR 안전성을 위해 `typeof window` 체크 (예: `useLocalStorage`)
- **이벤트 리스너**: 모든 스크롤/리사이즈 리스너는 가능한 한 passive 플래그 사용
- **ResizeObserver**: `useElementSize`와 `useScrollPosition`에서 사용
- **requestAnimationFrame**: 스크롤/리사이즈 콜백에서 레이아웃 스래싱 방지

## 브라우저 지원

- 최신 브라우저 (Chrome, Firefox, Safari, Edge)
- iOS 12+ (특수한 `visualViewport` 처리 포함)
- SSR 준비 완료 (적절한 보호 포함)

## 라이선스

MIT
