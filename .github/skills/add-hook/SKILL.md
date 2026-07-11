---
name: add-hook
description: 'use-hooks에 새 커스텀 React 훅 추가. Use when: useDebounce, useLocalStorage 같은 커스텀 훅을 생성할 때. React 19 기반, default export, 독립 디렉토리 구조.'
argument-hint: '훅 이름 (예: "useClickOutside", "useMediaQuery")'
---

# 커스텀 React 훅 추가

use-hooks 패키지에 새로운 커스텀 React 훅을 추가합니다.

## When to Use

- 새로운 커스텀 React 훅이 필요할 때
- use-hooks에 재사용 가능한 훅을 추가할 때

## Procedure

1. `use-hooks/src/hooks/{훅이름}/index.ts` 파일 생성
2. 훅 이름에 맞는 기능을 구현 (default export)
3. `use-hooks/src/hooks/index.ts`에 named export 추가
4. 기존 훅들의 패턴과 일관성 유지 (독립 디렉토리, default export)

## Rules

- **React 19** 기반
- **side-effects 없음**
- 훅 이름은 반드시 `use`로 시작
- 기존 훅 파일을 참고하여 코드 스타일 맞추기

## References

- 기존 훅: `use-hooks/src/hooks/` 하위 디렉토리 참조
- 프로젝트 컨벤션: [AGENTS.md](../../../AGENTS.md)
