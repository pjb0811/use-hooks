---
'@jbpark/use-hooks': minor
---

Add `useMediaQuery`, which subscribes to a CSS media query through
`matchMedia` and re-renders when it starts or stops matching. It covers the
conditions element size can't express — `prefers-color-scheme`,
`prefers-reduced-motion`, `orientation` — which `useResponsiveSize`'s
element-measured breakpoints don't reach. The subscription runs through
`useSyncExternalStore`, so the value stays consistent with concurrent
rendering, and `matchMedia`'s absence during SSR falls back to the
`defaultValue` option (`false` unless set) until the real value is readable on
the client. An optional `target` (a ref or an element) evaluates the query
against that element's window instead of the host one, for previews rendered
into an iframe or a portal. Extracted from a copy in `@jbpark/ui-kit`, whose
`useSystemPrefersDark` had hand-rolled the same `matchMedia` wiring.
