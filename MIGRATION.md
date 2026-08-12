# Migration Guide

[English](./MIGRATION.md) | [한국어](./MIGRATION.ko.md)

## v2 → v3

v3.0.0 is a major release with several breaking changes. This guide collects
the before/after for each one in a single place. If a hook isn't listed here,
its API is unchanged.

| Change                                         | Action                                                 |
| ---------------------------------------------- | ------------------------------------------------------ |
| `useTimeline` removed                          | Move to GSAP/motion, or pin `2.x`                      |
| `useClickOutside` takes the ref as an argument | Pass your own ref(s) instead of using the returned one |
| `useIntersectionObserver` return shape changed | Destructure `{ entry, isIntersecting }`                |
| `useScrollToElements` redesigned (index → key) | Register/scroll by string key                          |
| `useImage`'s `error` is now an `Error`         | Read `error.message` / `error.cause`                   |

---

### `useClickOutside`

Now takes the "inside" ref(s) as an argument instead of creating and returning
one. This lets you exclude both a trigger and a separately-mounted panel (e.g. a
portaled dropdown), and adds an opt-in `escape` option (default `false`) to
also close on the Escape key.

```tsx
// v2
const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);
<div ref={ref} />;

// v3 — single element
const ref = useRef<HTMLDivElement>(null);
useClickOutside(ref, () => setOpen(false), { enabled: open });
<div ref={ref} />;

// v3 — trigger + panel together (the point of the redesign)
const triggerRef = useRef<HTMLButtonElement>(null);
const panelRef = useRef<HTMLDivElement>(null);
useClickOutside([triggerRef, panelRef], () => setOpen(false), {
  enabled: open,
});
<button ref={triggerRef} />;
<div ref={panelRef} />;
```

The default listened event also changed from `mousedown` + `touchstart` to
`pointerdown` alone (configurable via the `events` option).

### `useIntersectionObserver`

Returns `[ref, { entry, isIntersecting }]` instead of `[ref, entry]`, adds
`freezeOnceVisible`, and `options` (threshold/rootMargin/root) is now reactive.

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

Redesigned from index-based registration to key-based. String keys avoid
mismatches when a list is reordered/filtered, and options can now be passed
per-call to `scrollTo`.

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

`elementRefs` is no longer exposed. When using `offset`, the scroll no longer
assumes `window` is the scrolling container — pass `container` (an element or
ref) to scroll a modal's own scrollable body.

### `useImage`

`error` is now a real `Error` instead of `string | Event | null` (the `string`
branch was never actually set). The original event is attached as `error.cause`.
`attemptCount` is now exposed for building retry UI.

```tsx
// v2
const { loading, error, loaded, retry } = useImage(src, { retryCount: 1 });
// error: string | Event | null

// v3
const { loading, error, loaded, retry, attemptCount } = useImage(src, {
  retryCount: 1,
});
// error: Error | null — error.message is a real description, error.cause is the original event
```

### `useTimeline` (removed)

`useTimeline` was removed in v3. It had no consumers across the apps that depend
on this library and duplicated capabilities already covered by animation
libraries.

- **Recommended:** move the animation to [GSAP](https://gsap.com/) or
  [motion](https://motion.dev/).
- **Staying on the old API:** pin to `2.x`, or copy the `2.x` implementation into
  your own project.

## Consuming apps

Notes for the two apps that depend on this library, when they move to v3:

- **ui-kit** — uses `useIntersectionObserver` in `list.tsx`; update to the
  `{ entry, isIntersecting }` return shape, and consider replacing the manual
  `fetchingRef` "already fired" guard with `freezeOnceVisible`.
- **live-editor** — currently on the v2 API; audit for the hooks listed above.
