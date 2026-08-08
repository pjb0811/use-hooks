---
'@jbpark/use-hooks': minor
---

Added `useKeyPress`, binding a key combo to a handler:

```ts
useKeyPress('Escape', () => setOpen(false));
useKeyPress(['Enter', ' '], handleSelect, { preventDefault: true });
useKeyPress('mod+z', undo, { ignore: '.cm-editor' });
```

- Accepts a single combo or an array, e.g. `'mod+shift+z'` or `['Enter', ' ']`. `mod` normalizes to Cmd on macOS / Ctrl elsewhere.
- Modifiers not named in a combo are required to be _absent_, not just ignored, so `'mod+z'` and `'mod+shift+z'` registered as separate bindings only ever fire one of them for a given keypress.
- `target` (default `window`), `enabled`, `preventDefault`, and `ignore` (a CSS selector — skip keydowns whose target is inside a matching element, e.g. a code editor with its own undo) options.
