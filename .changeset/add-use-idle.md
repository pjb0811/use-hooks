---
'@jbpark/use-hooks': minor
---

Add `useIdle`, which returns whether the user has done nothing for `timeout` ms, counting pointer, key, wheel and touch events on `window` (or custom `events`) and the page becoming visible as activity, without re-rendering on activity while already active.
