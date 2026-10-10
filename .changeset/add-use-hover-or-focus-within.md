---
'@jbpark/use-hooks': minor
---

Add `useHoverOrFocusWithin`, which tracks hover and focus-within as separate flags and returns `{ active, hovered, focusWithin, handlers }`. `active` stays true while either one is, and moving focus between two children of the container does not toggle it.
