---
'@jbpark/use-hooks': patch
---

Fix `useHash` so `setHash('')` removes the `#` from the URL without `replace` too, as it already did with `{ replace: true }`. The docs now note that a hash changed elsewhere with `history.pushState` or `replaceState` isn't seen until the next `hashchange`.
