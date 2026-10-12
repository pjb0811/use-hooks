---
'@jbpark/use-hooks': minor
---

Add `useHash`, which returns the URL hash without the `#` and a setter for it (`{ replace: true }` replaces the history entry), shared by every component through `useSyncExternalStore`.
