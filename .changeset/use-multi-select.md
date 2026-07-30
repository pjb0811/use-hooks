---
'@jbpark/use-hooks': minor
---

Add `useMultiSelect`: checkbox-style multi-select for a list, with shift-click range selection. Selection is clamped against the current item count (via `useMemo`, not an effect) so it stays valid as the backing list shrinks or grows.
