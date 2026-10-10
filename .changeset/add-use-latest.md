---
'@jbpark/use-hooks': minor
---

Add `useLatest`, which returns a ref that always holds the value from the latest committed render, for callbacks set up once (timers, listeners, observers) that must read the newest props.
