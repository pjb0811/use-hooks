---
'@jbpark/use-hooks': minor
---

Add `useBeforeUnload` for asking the browser to confirm before the page unloads while `enabled` is true, e.g. while there are unsaved changes. No `beforeunload` listener is attached while it is false.
