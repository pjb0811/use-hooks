---
'@jbpark/use-hooks': patch
---

Fix `usePendingCommit` so a write lasts until the end of the task it was made in at most. A change the parent rejects without re-rendering no longer comes back on the next edit; commits in the same task still build on each other.
