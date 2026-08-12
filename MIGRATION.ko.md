# 마이그레이션 가이드

[English](./MIGRATION.md) | [한국어](./MIGRATION.ko.md)

## v2 → v3

v3.0.0은 breaking change가 여럿 포함된 메이저 릴리스입니다. 각 항목의 전후
코드를 한곳에 모았습니다. 여기에 없는 훅은 API가 그대로입니다.

| 변경                                       | 조치                                    |
| ------------------------------------------ | --------------------------------------- |
| `useTimeline` 제거                         | GSAP/motion으로 이전하거나 `2.x` 고정   |
| `useClickOutside`가 ref를 인자로 받음      | 반환값 대신 직접 만든 ref(들)를 전달    |
| `useIntersectionObserver` 반환 형태 변경   | `{ entry, isIntersecting }`로 구조 분해 |
| `useScrollToElements` 재설계 (인덱스 → 키) | 문자열 키로 등록/스크롤                 |
| `useImage`의 `error`가 `Error`로 변경      | `error.message` / `error.cause` 사용    |

---

### `useClickOutside`

"안쪽" ref(들)를 만들어 반환하는 대신 **인자로 받도록** 바뀌었습니다. 트리거와
별도로 마운트되는 패널(예: 포털 드롭다운)을 함께 제외할 수 있고, Escape로도
닫을 수 있는 opt-in `escape` 옵션(기본 `false`)이 추가됐습니다.

```tsx
// v2
const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);
<div ref={ref} />;

// v3 — 단일 요소
const ref = useRef<HTMLDivElement>(null);
useClickOutside(ref, () => setOpen(false), { enabled: open });
<div ref={ref} />;

// v3 — 트리거 + 패널 함께 (재설계의 목적)
const triggerRef = useRef<HTMLButtonElement>(null);
const panelRef = useRef<HTMLDivElement>(null);
useClickOutside([triggerRef, panelRef], () => setOpen(false), {
  enabled: open,
});
<button ref={triggerRef} />;
<div ref={panelRef} />;
```

기본 감지 이벤트도 `mousedown` + `touchstart`에서 `pointerdown` 단독으로
바뀌었습니다(`events` 옵션으로 조절 가능).

### `useIntersectionObserver`

`[ref, entry]` 대신 `[ref, { entry, isIntersecting }]`를 반환하고,
`freezeOnceVisible`가 추가됐으며, `options`(threshold/rootMargin/root)가 이제
반응형입니다.

```tsx
// v2
const [ref, entry] = useIntersectionObserver({ threshold: 0.5 });
entry?.isIntersecting;

// v3
const [ref, { isIntersecting }] = useIntersectionObserver({
  threshold: 0.5,
  freezeOnceVisible: true,
});
```

### `useScrollToElements`

인덱스 기반 등록에서 키 기반으로 재설계됐습니다. 문자열 키는 리스트가
재정렬/필터링돼도 불일치가 없고, 옵션을 `scrollTo` 호출마다 전달할 수 있습니다.

```tsx
// v2
const { setElementRef, scrollToElement } = useScrollToElements({ offset: 16 });
<div ref={el => setElementRef(el, index)} />;
scrollToElement(index);

// v3
const { register, scrollTo } = useScrollToElements({ offset: 16 });
<div ref={register('section-1')} />;
scrollTo('section-1');
```

`elementRefs`는 더 이상 노출되지 않습니다. `offset` 사용 시 스크롤 컨테이너를
더 이상 `window`로 가정하지 않으므로, 모달 자체의 스크롤 영역 등을 스크롤하려면
`container`(요소 또는 ref)를 전달하세요.

### `useImage`

`error`가 `string | Event | null`에서 실제 `Error`로 바뀌었습니다(`string`
분기는 실제로 설정된 적이 없음). 원본 이벤트는 `error.cause`에 담깁니다.
재시도 UI를 위한 `attemptCount`도 이제 노출됩니다.

```tsx
// v2
const { loading, error, loaded, retry } = useImage(src, { retryCount: 1 });
// error: string | Event | null

// v3
const { loading, error, loaded, retry, attemptCount } = useImage(src, {
  retryCount: 1,
});
// error: Error | null — error.message는 실제 설명, error.cause는 원본 이벤트
```

### `useTimeline` (제거)

`useTimeline`은 v3에서 제거됐습니다. 이 라이브러리에 의존하는 앱들에 사용처가
없었고, 애니메이션 라이브러리가 이미 제공하는 기능과 중복됐습니다.

- **권장:** 애니메이션을 [GSAP](https://gsap.com/) 또는
  [motion](https://motion.dev/)으로 이전하세요.
- **기존 API 유지:** `2.x`로 고정하거나, `2.x` 구현을 프로젝트로 가져오세요.

## 소비 앱

이 라이브러리에 의존하는 두 앱이 v3로 올릴 때 참고할 사항:

- **ui-kit** — `list.tsx`에서 `useIntersectionObserver` 사용 중.
  `{ entry, isIntersecting }` 반환 형태로 업데이트하고, 수동 `fetchingRef`
  "이미 실행됨" 가드를 `freezeOnceVisible`로 대체하는 것을 검토하세요.
- **live-editor** — 현재 v2 API 기준. 위 훅들에 대해 점검이 필요합니다.
