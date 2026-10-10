---
'@jbpark/use-hooks': patch
---

Fix `useKeyPress` throwing `closest is not a function` when the `ignore` option is set and the `keydown` event target is `window` or `document`. Such an event is now never treated as inside an ignored element.
