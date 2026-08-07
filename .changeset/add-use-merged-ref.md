---
'@jbpark/use-hooks': minor
---

Added `useMergedRef`, merging any number of refs (forwarded function refs, `RefObject`s, or `null`/`undefined`) into a single callback ref. Handles React 19's optional per-ref cleanup return value.
