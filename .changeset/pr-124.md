---
'@jbpark/use-hooks': major
---

Removed `useTimeline`. It had zero consumers across both apps that depend on this library, was by far the largest hook (self-contained animation DSL driving inline styles via DOM selectors, plus a global, irreversible `CSS.registerProperty` registration), and duplicated capabilities already covered by GSAP/motion in those apps. If you were importing it directly, pin to `2.x` or bring the implementation into your own project.
