---
'@jbpark/use-hooks': minor
---

Add `useAsync` for running an async task after commit whenever its `deps` change and keeping `{ value, error, status }` in state. A run whose `deps` changed, that was disabled or whose component unmounted gets its `AbortSignal` aborted and its result ignored, and `value` stays while a new run is pending.
