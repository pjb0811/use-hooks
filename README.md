# use-hooks

[English](./README.md) | [한국어](./README.ko.md)

[![npm version](https://img.shields.io/npm/v/@jbpark/use-hooks.svg)](https://www.npmjs.com/package/@jbpark/use-hooks)
[![npm downloads](https://img.shields.io/npm/dm/@jbpark/use-hooks.svg)](https://www.npmjs.com/package/@jbpark/use-hooks)
[![GitHub issues](https://img.shields.io/github/issues/pjb0811/use-hooks)](https://github.com/pjb0811/use-hooks/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A collection of reusable React 19 hooks for common UI and interaction patterns. Built with TypeScript and Vite, optimized for both server-side rendering and client-side applications.

## Features

- 📦 **13 Production-Ready Hooks** - Utilities for scrolling, viewport, storage, and more
- 🎯 **Full TypeScript Support** - Complete type definitions for better development experience
- ⚡ **Tree-Shakeable** - Import only what you need
- 🔒 **SSR-Safe** - Built-in protection for window/document globals
- 📱 **iOS Optimized** - Special handling for mobile viewport characteristics
- 🧹 **Proper Cleanup** - All listeners and observers are properly cleaned up

## Installation

```bash
npm install @jbpark/use-hooks
```

Or with pnpm:

```bash
pnpm add @jbpark/use-hooks
```

## Usage

```tsx
import {
  useLocalStorage,
  useResponsiveSize,
  useThrottle,
  useWindowScroll,
} from '@jbpark/use-hooks';

function MyComponent() {
  // Persistent state using localStorage
  const [count, setCount] = useLocalStorage('count', 0);

  // Track window scroll position
  const { y, percent } = useWindowScroll();

  // Monitor element size with breakpoints
  const { size, breakpoint, ref } = useResponsiveSize();

  // Throttled width update
  const throttledWidth = useThrottle(size.width, 200);

  return (
    <div ref={ref}>
      <p>Count: {count}</p>
      <p>Scroll: {percent.y}%</p>
      <p>Breakpoint: {breakpoint.current}</p>
      <p>Throttled width: {throttledWidth}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

## Available Hooks

| Hook                  | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `useLocalStorage`     | JSON-based persistent state with error handling (SSR-safe)                  |
| `useWindowScroll`     | Track window scroll position and percentage (iOS visualViewport compatible) |
| `useElementScroll`    | Monitor scroll state of specific elements using ResizeObserver              |
| `useElementPosition`  | Monitor element bounding rect on scroll/resize (element ref support)        |
| `useResponsiveSize`   | Track element size with Tailwind-like breakpoints (debounced)               |
| `useBodyScrollLock`   | Lock/unlock body scroll with style preservation (iOS-specific handling)     |
| `useClickOutside`     | Run a callback when a click/touch happens outside a referenced element      |
| `useScrollToElements` | Scroll to specific elements by index (adjustable offset)                    |
| `useImage`            | Preload images and expose loading/error states                              |
| `useRecursiveTimeout` | Recursively schedule async/sync callbacks                                   |
| `useViewport`         | visualViewport support with in-app mode option and debounce                 |
| `useDebounce`         | Delay function execution to prevent excessive updates (autoInvoke support)  |
| `useThrottle`         | Throttle value updates to a fixed interval                                  |

## Development

```bash
# Start development server with HMR
pnpm dev

# Build library (tsc + vite)
pnpm build

# Preview built library
pnpm preview

# Run lint and type check
pnpm lint

# Format code with prettier
pnpm exec prettier --write .
```

## Project Structure

```
src/
├── hooks/                      # Individual hook implementations (one file per hook)
│   ├── use-body-scroll-lock.ts
│   ├── use-click-outside.ts
│   ├── use-debounce.ts
│   ├── use-element-position.ts
│   ├── use-element-scroll.ts
│   ├── use-image.ts
│   ├── use-local-storage.ts
│   ├── use-recursive-timeout.ts
│   ├── use-responsive-size.ts
│   ├── use-scroll-to-elements.ts
│   ├── use-throttle.ts
│   ├── use-viewport.ts
│   ├── use-window-scroll.ts
│   └── index.ts                # Barrel export
└── index.ts                    # Package entry point

dist/                            # Built library (ESM + types)
```

## Build & Deployment

This project uses a `develop` → `main` branch flow with automated, AI-assisted release notes:

- **Feature branches** merge into `develop`.
- On every push to `develop`, a workflow analyzes the diff and appends bullet points to the `## [Unreleased]` section of `CHANGELOG.md` (no version bump yet).
- When `develop` is merged into `main`, that `Unreleased` section is stamped with a version + date and `package.json` is bumped to match, opened as a release PR.
- Merging the release PR builds, publishes to npm, and tags the release.

The library is built as:

- **ES Module**: `dist/index.mjs`
- **Type Definitions**: `dist/index.d.ts`

## Key Patterns

- **One File Per Hook**: Each hook lives in a single flat file at `src/hooks/use-x.ts` (no per-hook folder/`index.ts`) and is re-exported from `src/hooks/index.ts`
- **Demo File Naming**: Each hook's demo page file is named `src/demo/use-x-demo.tsx`, matching the hook's own filename with a `-demo` suffix (the component name itself stays PascalCase, e.g. `ClickOutsideDemo`)
- **Window Protection**: Hooks accessing `window`/`document` check `typeof window` for SSR safety (e.g., `useLocalStorage`)
- **Event Listeners**: All scroll/resize listeners use passive flag when possible
- **ResizeObserver**: Used in `useResponsiveSize` and `useElementPosition` for performance
- **requestAnimationFrame**: Prevents layout thrashing in scroll/resize callbacks
- **iOS Compatibility**: Special handling of iOS visualViewport in `useBodyScrollLock`, `useWindowScroll`, and `useViewport`
- **Debounce**: Optional debouncing for resize events in `useResponsiveSize` and `useViewport`

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- iOS 12+ (with special visualViewport handling)
- SSR-ready (with proper guards)

## Contributing

Bug reports, feature suggestions, and code contributions are welcome!

- 🐛 **Bug Reports**: Report bugs in [Issues](https://github.com/pjb0811/use-hooks/issues)
- 💡 **Feature Requests**: Suggest new features in [Issues](https://github.com/pjb0811/use-hooks/issues)
- 🔧 **Code Contributions**: Send Pull Requests for review

Please check existing issues before creating a new one to avoid duplicates.

## License

MIT
