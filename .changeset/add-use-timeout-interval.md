---
'@jbpark/use-hooks': minor
---

Added `useTimeout` and `useInterval` — the basic single-shot and repeating timer hooks this library was missing (only the polling-oriented `useRecursiveTimeout` existed before).

Both treat `delay === null` as "inactive" and `0` as a valid delay, same rule `useRecursiveTimeout` follows — a bare `if (!delay)` guard is the classic bug this exists to avoid, since it silently no-ops for a delay of `0` too. Both read their callback through a ref, so a fresh function every render doesn't reset the timer.

```ts
const { reset, clear } = useTimeout(() => setOpen(false), open ? 2000 : null);
useInterval(() => setCount(c => c + 1), running ? 1000 : null);
```

`useTimeout` additionally returns `reset`/`clear` for imperative control — e.g. pausing a toast's auto-dismiss while hovered, then restarting it on mouse leave.
