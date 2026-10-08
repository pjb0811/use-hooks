---
'@jbpark/use-hooks': minor
---

Add `useSessionStorage`, the `sessionStorage` counterpart of `useLocalStorage`. Both hooks now share one internal factory, with a separate cache and subscriber list per storage area.
