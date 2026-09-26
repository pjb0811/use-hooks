---
'@jbpark/use-hooks': minor
---

Let `useDebouncedCallback` act on a call that is still waiting.

- The returned function now has `flush()`, which runs a waiting call right
  away, and `cancel()`, which drops it. Both do nothing when no call is
  waiting. The function keeps its stable identity and can still be called as
  before.
- A new `flushOnUnmount` option runs a waiting call when the component
  unmounts, with the latest callback, instead of dropping it. The default is
  unchanged: a waiting call is dropped on unmount.
- The `DebouncedCallback` type is exported for the returned function.
