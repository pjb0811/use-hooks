---
'@jbpark/use-hooks': minor
---

Add `useRovingFocus` for a roving tabindex: one Tab stop for a group of items, with the arrow keys for the orientation, Home and End moving focus between them. It remembers the item the user left, skips disabled items, wraps with `loop`, swaps Left and Right in a right-to-left container, and supports a controlled `activeIndex`.
