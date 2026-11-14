---
'@jbpark/use-hooks': minor
---

Add `replace` to `useHistoryState`: it changes the current value without adding an undo step, so a run of changes (such as a burst of typing) undoes in one step. Like `setValue`, it drops the redo history and ignores a value equal to the current one.
