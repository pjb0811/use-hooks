---
'@jbpark/use-hooks': major
---

`useClickOutside`'s `escape` option now defaults to `false` (previously `true`). This is a behavior change for any caller relying on the 3.0.0 default: Escape no longer closes the referenced element(s) unless you pass `escape: true` explicitly.
