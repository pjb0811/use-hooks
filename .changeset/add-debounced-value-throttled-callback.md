---
'@jbpark/use-hooks': minor
---

Added `useDebouncedValue(value, delay)` and `useThrottledCallback(callback, delay, options)`, rounding out the value/callback pairing for both debounce and throttle:

- `useDebouncedValue` is the value-shaped counterpart to `useDebounce` (which is callback-shaped), symmetric with `useThrottle`'s `(value, delay) => value` signature — the common "just give me the debounced value" case previously needed two pieces of state and an effect built on `useDebounce` by hand.
- `useThrottledCallback` throttles a callback directly instead of a value, with `leading`/`trailing` options (both default `true`).
- `useThrottle` also gains the same optional `leading`/`trailing` options (defaulting to its existing fixed behavior) — it's now implemented on top of `useThrottledCallback` internally instead of duplicating the same windowing logic a second time.
