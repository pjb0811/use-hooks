---
'@jbpark/use-hooks': patch
---

Fix `useLongPress` so `isLongPressed()` turns false in the task after a long press is released. Only the click that ends the long press reads `true`; a later click, such as one from the keyboard, is no longer skipped.
