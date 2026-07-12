# AGENTS.md

## 목적

이 문서는 `use-hooks` 저장소에서 에이전트(자동화 도구/코딩 어시스턴트)가 새 훅을 추가할 때 따라야 할 최소 기준을 정의합니다.

## 훅 추가 기준

1. 새 훅은 `src/hooks/{kebab-case-name}/index.ts`에 추가합니다. 디렉토리명은 케밥 케이스를 씁니다 (예: 훅 이름 `useClickOutside` → 디렉토리 `use-click-outside`).
2. 훅 이름(export 이름)은 반드시 `use`로 시작하는 camelCase를 씁니다. (예: `useClickOutside`)
3. 훅은 `default export`를 사용합니다.
4. `src/hooks/index.ts`에 named export를 추가합니다.
5. 외부 노출은 `src/index.ts`의 `export * from './hooks';` 체인을 유지합니다.

## 구현 규칙

- React 19 기준으로 작성합니다.
- 기존 훅과 동일한 디렉토리/코드 스타일을 유지합니다.
- 불필요한 전역 부작용(side-effects)을 만들지 않습니다.

## 참고

- 훅 구현 예시: `src/hooks/use-debounce/index.ts`
- 훅 export 목록: `src/hooks/index.ts`
