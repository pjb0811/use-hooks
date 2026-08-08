---
'@jbpark/use-hooks': major
---

Redesigned `useIntersectionObserver`'s return shape and added missing capabilities:

- Returns `[ref, { entry, isIntersecting }]` instead of `[ref, entry]` — nearly every consumer only read `entry?.isIntersecting` anyway (ui-kit's infinite scroll included).
- Added `freezeOnceVisible` — disconnects for good the first time the target becomes intersecting, covering the common "seen once, that's enough" case (lazy loading, entrance animations, infinite-scroll triggers) that previously needed the consumer to track their own "already fired" flag.
- `options` (threshold/rootMargin/root) is now actually reactive — previously captured once and never reconnected, so it could never be changed at runtime despite looking like a normal prop.

```ts
// before
const [ref, entry] = useIntersectionObserver({ threshold: 0.5 });
entry?.isIntersecting;

// after
const [ref, { isIntersecting }] = useIntersectionObserver({
  threshold: 0.5,
  freezeOnceVisible: true,
});
```
