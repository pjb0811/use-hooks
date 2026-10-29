---
'@jbpark/use-hooks': minor
---

Add `useFullscreen` for showing an element full screen with the Fullscreen API. It returns `isFullscreen` (kept in sync with `fullscreenchange`, including Esc), `isSupported`, `enter`, `exit`, `toggle` and the last rejected request as `error`, and is SSR-safe.
