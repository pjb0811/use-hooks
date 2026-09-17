---
'@jbpark/use-hooks': patch
---

`useScrollToElements` now scrolls the target's nearest scrollable ancestor when
`offset` is set, instead of falling straight back to `window`. Passing `offset`
used to silently change _what_ scrolls: without it the hook delegates to
`scrollIntoView`, which walks up to the element's own scroll container, while
with it the hook moved the page even when the element lived inside a scrollable
box — so the box never moved and the target never came into view. The lookup
matches `scrollIntoView`'s: the nearest ancestor whose computed `overflow-y` is
`auto`, `scroll`, or `overlay` and that actually overflows, with `window` as the
final fallback. The `container` option still takes precedence and is now only
needed when the right scroller isn't an ancestor.
