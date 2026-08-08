---
'@jbpark/use-hooks': minor
---

Added `useFileDrop`, pairing with `useFileToDataUrl` to cover a drag-and-drop upload area end to end:

```ts
const { dropRef, isDragging } = useFileDrop({
  onDrop: files => addFiles(files),
  accept: 'image/*',
  multiple: true,
  disabled,
});
```

- `isDragging` is tracked with an enter/leave counter rather than a plain boolean, since `dragleave` also fires when the pointer moves onto a child element — a plain boolean would flicker `isDragging` off and back on as the pointer crosses child boundaries.
- `accept` filters dropped files using the same format as the native `<input accept>` attribute (extensions, MIME types, or wildcard subtypes like `image/*`).
- `multiple: false` truncates to the first accepted file.
