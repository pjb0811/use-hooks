---
'@jbpark/use-hooks': minor
---

Add `useAnimationFrameCallback`, which runs a callback once per animation frame with the arguments of the last call and returns `[schedule, cancel]`. `useElementPosition` now uses it, so a burst of scroll, resize and DOM events measures the element once per frame instead of once per event.
