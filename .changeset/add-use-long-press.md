---
'@jbpark/use-hooks': minor
---

Add `useLongPress`, which calls a callback once a pointer press (or, with `keyboard: true`, holding Enter or Space) lasts `threshold` ms, cancels on release, leave or movement past `moveTolerance`, and reports `isLongPressed()` so a click handler can skip the click that ends a long press.
