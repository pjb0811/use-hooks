---
'@jbpark/use-hooks': minor
---

Added `useEventListener`, `usePrevious`, and `useToggle` — following the issue's recommended order (these first since the other small-utility candidates, `useForceUpdate`/`useIsMounted`, don't build on them the way the rest of this library does).

```ts
useEventListener('resize', () => setWidth(window.innerWidth));
useEventListener('error', onError, { target: window, capture: true });

const previous = usePrevious(value);

const [open, toggle, setOpen] = useToggle(false);
```

- `useEventListener` resolves `target` (default `window`, or a `RefObject`/raw `EventTarget`) and (de)registers the listener — the addEventListener/removeEventListener pair duplicated across ui-kit (marquee item) and live-editor (error handlers). Handler is read through a ref so a fresh function every render doesn't tear down and re-add it.
- `usePrevious` returns the value from the previous render, for comparisons like detecting a false-to-true transition.
- `useToggle` is the boolean-toggle-with-a-direct-setter shape ui-kit's dropdown/collapse/drawer/modal all reimplement.
