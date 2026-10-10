---
'@jbpark/use-hooks': minor
---

Add `useCopyToClipboard`, which copies text with `navigator.clipboard.writeText` and returns `{ copy, copied, error }`. `copied` resets after `resetDelay` ms, each copy restarts that time, and the timer is cleared on unmount.
