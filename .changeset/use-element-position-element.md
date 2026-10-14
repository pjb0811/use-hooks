---
'@jbpark/use-hooks': minor
---

Add two options to `useElementPosition`: `withElement: true` returns `{ rect, element }` with the target the last measurement used, and `mutation` adds `MutationObserver` options (such as attribute changes) to the DOM watch for selector and getter targets. Calls without them are unchanged.
