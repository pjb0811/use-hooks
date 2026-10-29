---
'@jbpark/use-hooks': minor
---

Add `useMap` for key-value pairs held in state, the `useSet` counterpart: `set`, `update`, `delete`, `setAll` and `clear` produce a new `Map` on every change, keep the current one when nothing changes, and keep one identity for the life of the component.
