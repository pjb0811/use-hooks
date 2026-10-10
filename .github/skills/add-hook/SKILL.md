---
name: add-hook
description: 'use-hooks에 새 커스텀 React 훅 추가. Use when: useDebounce, useLocalStorage 같은 커스텀 훅을 생성할 때. React 19 기반, src/hooks 아래 평평한 kebab-case 파일, default export, 같은 위치의 테스트와 문서 사이트 데모까지 추가.'
argument-hint: '훅 이름 (예: "useClickOutside", "useMediaQuery")'
---

# 커스텀 React 훅 추가

use-hooks 패키지에 새로운 커스텀 React 훅을 추가합니다. 규칙의 원문은 [AGENTS.md](../../../AGENTS.md)의 "훅 추가 기준"이고, 이 스킬은 그 절차를 따릅니다. 둘이 다르면 AGENTS.md를 따르고 이 파일을 고칩니다.

## When to Use

- 새로운 커스텀 React 훅이 필요할 때
- 다른 저장소에서 쓸 범용 훅을 여기에 먼저 구현할 때(공유 `shared-library-first` 스킬)

## Procedure

1. `src/hooks/{kebab-case-name}.ts` 파일을 만든다. 하위 디렉터리가 아니라 평평한 파일이다(예: `useClickOutside` → `src/hooks/use-click-outside.ts`).
2. 훅을 구현하고 `default export`로 내보낸다.
3. `src/hooks/index.ts`에 named export를 추가한다. 외부 노출은 `src/index.ts`의 `export * from './hooks';`를 그대로 쓴다.
4. 같은 위치에 `src/hooks/{kebab-case-name}.test.ts`를 추가하고 `pnpm test`로 확인한다(Vitest + jsdom, `@testing-library/react`의 `renderHook`).
5. 데모를 추가한다: `website/src/demo/{kebab-case-name}-demo.tsx`와 해당 카테고리 문서(`website/docs/hooks/*.mdx`)의 import·렌더링, 그리고 데모 바로 아래 ` ```tsx ` 사용 예시.

## Rules

- **React 19** 기반
- **side-effects 없음**
- 훅 이름(export 이름)은 반드시 `use`로 시작하는 camelCase
- 파일명은 케밥 케이스
- 기존 훅 파일을 참고하여 코드 스타일 맞추기(예: `src/hooks/use-debounced-value.ts`)

## References

- 기존 훅: `src/hooks/`
- 프로젝트 컨벤션: [AGENTS.md](../../../AGENTS.md)
