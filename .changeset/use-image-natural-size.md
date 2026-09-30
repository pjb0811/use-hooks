---
'@jbpark/use-hooks': minor
---

Let `useImage` report the loaded image's intrinsic size.

- The hook now also returns `naturalSize`, `{ width, height }` read from the
  image's `naturalWidth`/`naturalHeight` once it loads, so callers no longer
  need a second `new Image()` for the same URL to reserve an aspect ratio.
- It is `null` while loading, after an error, and for an empty `src`, and it
  resets in the same render as `loading` when `src`, the retry options or
  `retry()` trigger a reload, so a previous image's size is never reported for
  the next one.
- Additive: no new option, and existing return values are unchanged.
