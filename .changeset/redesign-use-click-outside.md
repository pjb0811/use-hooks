---
'@jbpark/use-hooks': major
---

Redesigned `useClickOutside` to take the "inside" ref(s) as an argument instead of creating and returning one:

- Accepts a single ref or an array of refs — lets you exclude both a trigger element and a separately-mounted panel (e.g. a portaled dropdown/popover), which fixes the classic bug where clicking the trigger to close something re-opens it because the trigger itself registers as an "outside" click.
- Switched the default listened event from `mousedown` + `touchstart` (which can double-fire a handler on touch devices) to `pointerdown` alone; still configurable via the new `events` option.
- Added an `escape` option (default `true`) to also close on the Escape key.

```ts
// before
const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);
<div ref={ref} />

// after
const triggerRef = useRef<HTMLButtonElement>(null);
const panelRef = useRef<HTMLDivElement>(null);
useClickOutside([triggerRef, panelRef], () => setOpen(false), { enabled: open });
<button ref={triggerRef} />
<div ref={panelRef} />
```
