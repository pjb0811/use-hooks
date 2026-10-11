---
'@jbpark/use-hooks': minor
---

`useElementPosition` now accepts a getter function in addition to a ref or a CSS selector, and a `measure` option that replaces `getBoundingClientRect()`. A getter is called on every measurement and after every render, so it can return a different element over time. Existing ref and selector calls behave as before.
