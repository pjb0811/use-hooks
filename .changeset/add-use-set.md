---
'@jbpark/use-hooks': minor
---

Add `useSet`, which holds a `Set` of keys in state with `add`, `delete`, `toggle` (with an optional `force`), `set` and `clear`. Every change produces a new `Set`, an action that changes nothing keeps the current one, and the actions keep one identity.
