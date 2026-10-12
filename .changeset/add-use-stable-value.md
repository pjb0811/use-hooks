---
'@jbpark/use-hooks': minor
---

Add `useStableValue`, which keeps an object or array's previous reference while the new value is shallowly equal (or equal by a custom `isEqual`), so an inline prop keeps one identity until its contents change.
