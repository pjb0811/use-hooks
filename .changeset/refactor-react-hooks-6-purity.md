---
'@jbpark/use-hooks': patch
---

Fix internal implementation of useDebouncedCallback, useThrottledCallback, useMultiSelect, useFileDrop, and useImage to satisfy React's render-purity rules (no ref reads/writes or synchronous setState during render). No public API changes — prop-driven state resets (e.g. clamping useMultiSelect on a count shrink, useFileDrop's isDragging on disabled) now land in the same render as their trigger instead of the render after, removing a brief stale-state flash.
