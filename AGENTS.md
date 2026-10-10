# AGENTS.md

## 목적

이 문서는 `use-hooks` 저장소에서 에이전트(자동화 도구/코딩 어시스턴트)가 새 훅을 추가할 때 따라야 할 최소 기준을 정의합니다.

**이 저장소는 재사용 가능한 React 훅의 정본(canonical home)이다.** `live-editor` 같은 앱 저장소에서 새 훅이 필요할 때, 그게 특정 앱 도메인에 묶이지 않은 범용 훅이라면 그 앱 저장소에 바로 구현하지 말고 여기 먼저 구현하고 배포한 뒤 의존성으로 가져다 쓰게 한다. 자세한 판단 기준과 절차는 공유 `shared-library-first` 스킬 참고.

## 훅 추가 기준

1. 새 훅은 `src/hooks/{kebab-case-name}.ts`에 추가합니다 (서브디렉토리가 아니라 평평한 named file). 파일명은 케밥 케이스를 씁니다 (예: 훅 이름 `useClickOutside` → 파일 `use-click-outside.ts`).
2. 훅 이름(export 이름)은 반드시 `use`로 시작하는 camelCase를 씁니다. (예: `useClickOutside`)
3. 훅은 `default export`를 사용합니다.
4. `src/hooks/index.ts`에 named export를 추가합니다.
5. 외부 노출은 `src/index.ts`의 `export * from './hooks';` 체인을 유지합니다.
6. 데모 페이지도 함께 추가합니다: `website/src/demo/{kebab-case-name}-demo.tsx` + 해당 카테고리 문서(`website/docs/hooks/*.mdx`)에 `@site/src/demo/...` import와 렌더링 추가 (기존 훅 데모 참고). 사용 예시 스니펫은 데모 컴포넌트가 아니라 MDX의 ` ```tsx ` 코드블록으로 데모 바로 아래에 씁니다.
7. 훅과 같은 위치에 테스트 `src/hooks/{kebab-case-name}.test.ts`를 추가하고 `pnpm test`가 통과하는지 확인합니다. 테스트 러너는 Vitest(jsdom)이고 훅은 `@testing-library/react`의 `renderHook`으로 테스트합니다. 예시: `src/hooks/use-local-storage.test.ts`.

## 데모에서 ui-kit 컴포넌트 사용 기준

데모는 문서 사이트(`website/`)의 `@jbpark/ui-kit` 의존성을 자유롭게 쓸 수 있지만, 다음 기준으로 나눠서 판단합니다.

- **훅의 동작을 직접 보여주는 부분 → raw 엘리먼트를 유지**합니다. 그 자리를 ui-kit 컴포넌트로 바꿨을 때, 그 컴포넌트가 내부적으로 같은 기능을 이미 내장하고 있으면(예: ui-kit `Modal`은 자체적으로 body 스크롤을 잠그고, `Popover`/`Dropdown`은 바깥 클릭 닫기를 내장하고, `Upload`는 내부에서 이 저장소의 `useFileDrop`/`useFileToDataUrl`을 직접 사용) 훅을 지워도 데모 동작이 똑같아져 버립니다 — 무엇을 시연하는 데모인지가 사라집니다. 이 경우 raw 엘리먼트를 유지하되 접근성 속성(`role`, `aria-*`, 키보드 처리 등)은 갖춥니다.
- **훅과 무관한 주변 UI(버튼, 입력, 상태 표시, 레이아웃 등) → ui-kit을 적극 사용**합니다.

## 구현 규칙

- React 19 기준으로 작성합니다.
- 기존 훅과 동일한 파일/코드 스타일을 유지합니다.
- 불필요한 전역 부작용(side-effects)을 만들지 않습니다.

## 주석

주석은 지금 코드를 처음 읽는 사람을 위해 씁니다. 무엇을 하는지 먼저 쓰고, 이유는 지켜야 할 제약일 때만 현재형으로 쓰며, 과거 이야기는 이슈 번호(`(#N)`)로 대신합니다. 자세한 규칙과 예시는 공유 `coding-style` 스킬의 "C. 주석 작성"을 따릅니다.

## Changeset

- PR에 `.changeset/*.md`가 없으면 `changeset-draft.yml`이 PR 브랜치에 초안 changeset 커밋을 push합니다. 모델이 쓴 문구와 bump라 실제 변경과 맞지 않을 수 있습니다.
- 일부러 changeset을 넣지 않는 PR(문서·CI·리팩터링만 바꾸는 PR, 아직 배포되지 않은 변경을 다듬는 PR 등)에는 `pnpm changeset --empty`로 빈 changeset을 넣습니다. bump와 CHANGELOG 항목 없이 draft만 건너뜁니다. 빈 changeset만 쌓인 Version PR은 그 파일을 지우기만 하고 버전은 그대로입니다.
- 머지를 확인할 때 PR head SHA가 로컬 tip과 다르면 추가된 커밋(`git log <local>..<head>`)을 확인합니다. 봇이 넣은 changeset은 다음 Version PR의 CHANGELOG와 GitHub Release로 그대로 나갑니다(live-editor 4.5.0에서 실제로 발생).
- 버전·배포 흐름 전체는 `.claude/skills/version-management/SKILL.md`를 참고합니다.

## 공유 스킬

모든 pjb0811 저장소가 함께 쓰는 절차는 비공개 저장소 `pjb0811/skills`의 전역 Claude Code 스킬입니다. 그 스킬을 읽을 수 없는 에이전트는 이 파일의 요약을 따릅니다.

| 스킬                                  | 용도                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| `commit`, `pr`, `issue`               | 커밋 메시지, PR·이슈 본문                                                      |
| `coding-style`                        | 컨벤션, 일괄 리네임, 주석(C), boolean 이름(D), 중괄호(E), 서브컴포넌트 구조(F) |
| `changesets-release`, `publish-check` | 릴리스 흐름과 배포 전 점검                                                     |
| `shared-library-first`                | 재사용 UI는 ui-kit, 훅은 use-hooks에 먼저 구현                                 |
| `ref-verification`                    | 저장소 상태를 작업 트리가 아니라 git ref 기준으로 확인                         |

### 커밋 메시지

- `type(scope): summary`: 영어 명령문, 소문자로 시작, 마침표 없음, gitmoji 없음.
- 스코프는 변경이 한 영역에 한정될 때만 붙입니다. 브랜치 이름은 쓰지 않습니다.
- 호환성을 깨는 변경은 타입이나 스코프 뒤에 `!`를 붙입니다(`refactor(api)!: …`).
- 본문은 무엇을 바꿨는지 구체적으로 쓴 `-` 불릿입니다. 호환성을 깨는 변경이면 무엇이 깨지고 무엇으로 대체하는지 씁니다.
- `Co-Authored-By` 같은 트레일러는 붙이지 않습니다.

### 저장소 스킬

| 스킬                    | 경로                                    | 설명                                  |
| ----------------------- | --------------------------------------- | ------------------------------------- |
| `add-hook`              | `.github/skills/add-hook/`              | 새 훅 추가 (위 "훅 추가 기준"을 따름) |
| `version-management`    | `.claude/skills/version-management/`    | 이 저장소의 패키지·배포 세부 사항     |
| `react-best-practices`  | `.claude/skills/react-best-practices/`  | Vercel, React 성능 규칙               |
| `composition-patterns`  | `.claude/skills/composition-patterns/`  | Vercel, 컴포넌트 합성 패턴            |
| `web-design-guidelines` | `.claude/skills/web-design-guidelines/` | Vercel, UI·접근성 리뷰                |
| `writing-guidelines`    | `.claude/skills/writing-guidelines/`    | Vercel, 문서 문체 리뷰                |
| `deploy-to-vercel`      | `.claude/skills/deploy-to-vercel/`      | Vercel, 문서 사이트 배포              |

Vercel 스킬은 [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) `063bee9`에서 수정 없이 가져왔습니다(패키징 파일 `Archive.zip` 제외). `.prettierignore`에 있어 포매터가 바꾸지 않습니다. 갱신할 때는 새 커밋에서 디렉터리를 다시 복사하고 이 커밋을 바꿉니다.

## 참고

- 훅 구현 예시: `src/hooks/use-debounced-value.ts`
- 훅 export 목록: `src/hooks/index.ts`
- 데모는 문서 사이트 안(`website/src/demo/`)에 살고, 훅은 `../../../src/hooks`에서 소스로 직접 가져옵니다. 라이브러리와 사이트가 별도 pnpm 프로젝트라 데모를 라이브러리 쪽에 두면 `@jbpark/ui-kit`이 두 벌 설치돼 context가 갈립니다 (#195, #196). 데모에서 쓰는 패키지는 `website/package.json`에만 추가합니다.
