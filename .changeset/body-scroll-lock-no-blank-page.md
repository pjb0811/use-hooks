---
'@jbpark/use-hooks': patch
---

`useBodyScrollLock` no longer blanks the page while the lock is held. It set
`overflow: hidden` on the body in addition to the root element, and because the
body is also given `position: fixed; top: -<scrollY>px`, that clip box sits
entirely above the viewport for any lock taken below the top of the page — so
every bit of page content was clipped away and the modal appeared to float over
an empty backdrop. A `position: fixed` overlay escapes ancestor clipping, which
is why the symptom looked like an opaque overlay rather than a rendering bug.
The root element keeps `overflow: hidden`, which is what actually suppresses the
scrollbar, and the lock itself is unchanged.
