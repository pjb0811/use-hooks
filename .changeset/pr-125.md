---
'@jbpark/use-hooks': major
---

Redesigned `useScrollToElements`'s API from index-based registration (`elementRefs`/`setElementRef(el, index)`/`scrollToElement(index)`) to key-based (`register(key)`/`scrollTo(key, options)`):

- String keys instead of array indices — no more mismatches when a list is reordered/filtered, and no leftover `null` holes when an item is removed (registration is now a `Map`, cleaned up automatically on unmount).
- `elementRefs` is no longer exposed — it was a leaked implementation detail.
- Options can now be passed per-call to `scrollTo`, not just once at the hook level.
- The `offset` scroll path no longer assumes `window` is the scrolling container — pass `container` (an element or ref) to scroll a modal's own scrollable body, an iframe's body, etc. instead.

```ts
// before
const { setElementRef, scrollToElement } = useScrollToElements({ offset: 16 });
<div ref={el => setElementRef(el, index)} />;
scrollToElement(index);

// after
const { register, scrollTo } = useScrollToElements({ offset: 16 });
<div ref={register('section-1')} />;
scrollTo('section-1');
```
