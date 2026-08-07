---
'@jbpark/use-hooks': minor
---

Added `useResizeObserver` and `useMutationObserver`.

`useResizeObserver` returns a `[ref, size]` tuple (same convention as `useIntersectionObserver`) reporting an element's own width/height — the unprocessed primitive behind `useResponsiveSize`/`useElementScroll`/`useElementPosition`, which each shape the value for their own purpose instead of exposing it directly.

`useMutationObserver(target, callback, options)` takes its target directly — a `RefObject`, or a plain `Node` like `document.head` that isn't behind any React ref — and reads `callback` through a ref so passing a fresh inline function every render doesn't tear down and resubscribe the observer.
