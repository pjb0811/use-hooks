---
name: component-naming
description: "ui-kit에서 검증된 컴포넌트 폴더/export 네이밍 및 배럴 파일 규칙(kebab-case 폴더 + PascalCase export + 서브컴포넌트 배럴)을 이 저장소의 향후 목표 컨벤션으로 문서화. 아직 기존 코드에 소급 적용된 상태는 아님 — 새로 서브컴포넌트/조합(composition) 컴포넌트를 추가할 때만 참고. Use when '서브컴포넌트 있는 컴포넌트/훅 추가', '조합 컴포넌트 구조', 'compound component 패턴', '배럴 파일 어떻게 구성해' 같은 요청이 있을 때."
---

# Component Naming (목표 컨벤션 — use-hooks)

이 문서는 [ui-kit](https://github.com/pjb0811/ui-kit)에서 실제로 적용/검증된 컴포넌트 네이밍·배럴 파일 규칙을 이 저장소의 **향후 목표 컨벤션**으로 가져온 것이다. `AGENTS.md`에 이미 정의된 훅 추가 규칙(`src/hooks/{kebab-case-name}/index.ts`, `default export`)과 어울리는 방향이라 채택했다.

⚠️ **소급 적용 아님**: 기존 훅/데모 컴포넌트를 이 규칙에 맞춰 일괄 리네임하지 않는다. 아래는 앞으로 **서브컴포넌트가 있는 새 훅이나 데모 컴포지션 컴포넌트**를 추가할 때만 적용한다. 지금 저장소엔 아직 이 패턴이 필요한 서브컴포넌트 구조가 없다 — 필요해지면 이 문서를 따른다.

## 기본 규칙

- 폴더/파일명: **kebab-case** — `AGENTS.md`의 훅 네이밍 규칙과 동일한 방향이라 이미 자연스럽게 지켜지고 있음 (`src/hooks/use-click-outside/`, `src/demo/use-debounce-demo.tsx`)
- export되는 컴포넌트/함수/Props 식별자: **원래 이름 그대로 유지** (예: 훅이면 `useClickOutside` camelCase, 데모 컴포넌트면 `ClickOutsideDemo` PascalCase) — 폴더/파일명 케이스와 export 식별자 케이스는 별개다

## 서브컴포넌트가 있는 조합 컴포넌트를 추가하게 되면

중첩 폴더 대신 **같은 depth의 형제 파일**로 구성하고, `index.ts`는 재export 전용 배럴로 둔다:

```
some-thing/
├── some-thing.tsx  # 메인 구현
├── sub-part.tsx     # 서브컴포넌트 (원래 export 이름 그대로)
└── index.ts         # 순수 배럴, 구현 없음
```

**배럴은 명시적 교차 타입 캐스팅으로 부착한다** — import된 바인딩에는 TypeScript의 expando property 지원이 적용되지 않아서 `Main.Sub = Sub` 직접 대입은 `TS2339` 에러가 난다:

```ts
// index.ts
import MainImpl, { type Props } from './some-thing';
import SubPart from './sub-part';

type MainComponent = typeof MainImpl & { SubPart: typeof SubPart };

const Main = MainImpl as MainComponent;
Main.SubPart = SubPart;

export default Main;
export type { Props };
```

- 서브컴포넌트 파일명은 부모 폴더 경로가 구분자 역할을 하므로 접두어 없이 짧은 이름 그대로 쓴다.
- 서브컴포넌트가 메인 구현에서 부착 목적 외에도 **런타임에 실제로 쓰이는 경우**(타입 체크 등)라면 그 import를 지우지 않는다.

## 관련

- 케이스 무관 일반 절차(기존 컨벤션 파악, 안전한 일괄 리네임)는 `coding-style` 스킬 참고.
- 원본 규칙과 채택 배경: ui-kit `.claude/skills/component-naming/SKILL.md` (2026-07-18 PascalCase→kebab-case 일괄 전환 및 서브컴포넌트 재정리 기록).
