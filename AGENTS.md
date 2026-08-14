# AGENTS.md

## 목적

이 문서는 `use-hooks` 저장소에서 에이전트(자동화 도구/코딩 어시스턴트)가 새 훅을 추가할 때 따라야 할 최소 기준을 정의합니다.

**이 저장소는 재사용 가능한 React 훅의 정본(canonical home)이다.** `live-editor` 같은 앱 저장소에서 새 훅이 필요할 때, 그게 특정 앱 도메인에 묶이지 않은 범용 훅이라면 그 앱 저장소에 바로 구현하지 말고 여기 먼저 구현하고 배포한 뒤 의존성으로 가져다 쓰게 한다. 자세한 판단 기준과 절차는 `.claude/skills/coding-style/SKILL.md`의 "D. 재사용 가능한 UI/훅은 공유 라이브러리에 먼저 구현" 참고.

## 훅 추가 기준

1. 새 훅은 `src/hooks/{kebab-case-name}.ts`에 추가합니다 (서브디렉토리가 아니라 평평한 named file). 파일명은 케밥 케이스를 씁니다 (예: 훅 이름 `useClickOutside` → 파일 `use-click-outside.ts`).
2. 훅 이름(export 이름)은 반드시 `use`로 시작하는 camelCase를 씁니다. (예: `useClickOutside`)
3. 훅은 `default export`를 사용합니다.
4. `src/hooks/index.ts`에 named export를 추가합니다.
5. 외부 노출은 `src/index.ts`의 `export * from './hooks';` 체인을 유지합니다.
6. 데모 페이지도 함께 추가합니다: `src/demo/{kebab-case-name}-demo.tsx` + `src/App.tsx`의 nav/route 등록 (기존 훅 데모 참고).

## 데모에서 ui-kit 컴포넌트 사용 기준

데모는 각 훅의 `@jbpark/ui-kit` devDependency를 자유롭게 쓸 수 있지만, 다음 기준으로 나눠서 판단합니다.

- **훅의 동작을 직접 보여주는 부분 → raw 엘리먼트를 유지**합니다. 그 자리를 ui-kit 컴포넌트로 바꿨을 때, 그 컴포넌트가 내부적으로 같은 기능을 이미 내장하고 있으면(예: ui-kit `Modal`은 자체적으로 body 스크롤을 잠그고, `Popover`/`Dropdown`은 바깥 클릭 닫기를 내장하고, `Upload`는 내부에서 이 저장소의 `useFileDrop`/`useFileToDataUrl`을 직접 사용) 훅을 지워도 데모 동작이 똑같아져 버립니다 — 무엇을 시연하는 데모인지가 사라집니다. 이 경우 raw 엘리먼트를 유지하되 접근성 속성(`role`, `aria-*`, 키보드 처리 등)은 갖춥니다.
- **훅과 무관한 주변 UI(버튼, 입력, 상태 표시, 레이아웃 등) → ui-kit을 적극 사용**합니다.

## 구현 규칙

- React 19 기준으로 작성합니다.
- 기존 훅과 동일한 파일/코드 스타일을 유지합니다.
- 불필요한 전역 부작용(side-effects)을 만들지 않습니다.

## 참고

- 훅 구현 예시: `src/hooks/use-debounce.ts`
- 훅 export 목록: `src/hooks/index.ts`
