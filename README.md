# use-hooks

[English](./README.md) | [한국어](./README.ko.md)

[![npm version](https://img.shields.io/npm/v/@jbpark/use-hooks.svg)](https://www.npmjs.com/package/@jbpark/use-hooks)
[![npm downloads](https://img.shields.io/npm/dm/@jbpark/use-hooks.svg)](https://www.npmjs.com/package/@jbpark/use-hooks)
[![GitHub issues](https://img.shields.io/github/issues/pjb0811/use-hooks)](https://github.com/pjb0811/use-hooks/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A collection of reusable React 19 hooks for common UI and interaction patterns. Built with TypeScript and Vite, optimized for both server-side rendering and client-side applications.

## Features

- 📦 **30 Production-Ready Hooks** - Utilities for scrolling, viewport, storage, observers, events, timing, and more
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
  useThrottledValue,
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
  const throttledWidth = useThrottledValue(size.width, 200);

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

| Hook                      | Description                                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `useLocalStorage`         | JSON-based persistent state with error handling (SSR-safe)                                                       |
| `useHistoryState`         | Undo/redo state management with a configurable history limit                                                     |
| `useControllableState`    | Back a value/defaultValue/onChange prop pair with one controlled/uncontrolled state hook                         |
| `usePrevious`             | Return a value as it was on the previous render                                                                  |
| `useToggle`               | Boolean state with a toggle and an explicit setter                                                               |
| `useMultiSelect`          | Checkbox-style multi-select for a list, with shift-click range selection                                         |
| `useWindowScroll`         | Track window scroll position and percentage (iOS visualViewport compatible)                                      |
| `useElementScroll`        | Monitor scroll state of specific elements using ResizeObserver                                                   |
| `useElementPosition`      | Monitor element bounding rect on scroll/resize (element ref support)                                             |
| `useResponsiveSize`       | Track element size with Tailwind-like breakpoints (debounced)                                                    |
| `useViewport`             | visualViewport support with in-app mode option and debounce                                                      |
| `useScrollToElements`     | Register elements by key and scroll to them by key (adjustable offset, optional container)                       |
| `useBodyScrollLock`       | Lock/unlock body scroll with style preservation (iOS-specific handling)                                          |
| `useIntersectionObserver` | Track viewport intersection; returns `[ref, { entry, isIntersecting }]` with optional `freezeOnceVisible`        |
| `useResizeObserver`       | Track an element's own width/height via a callback ref (content-box or border-box)                               |
| `useMutationObserver`     | Observe DOM mutations on a ref or a raw node (e.g. `document.head`)                                              |
| `useEventListener`        | Add/remove an event listener on `window`, a ref, or a raw target                                                 |
| `useClickOutside`         | Run a callback when a click/touch (or `Escape`) happens outside the referenced element(s); accepts multiple refs |
| `useKeyPress`             | Run a callback on key combos with `mod`/`ctrl`/`meta`/`shift`/`alt` and aliases like `space`/`esc`               |
| `useFileDrop`             | Drag-and-drop file zone with `accept`/`multiple` filtering; returns `{ dropRef, isDragging }`                    |
| `useFileToDataUrl`        | Read a `File`/`Blob` into a data URL                                                                             |
| `useDebouncedCallback`    | Auto-invoke a debounced callback when deps change (`leading`/`autoInvoke` options); alias: `useDebounce`         |
| `useDebouncedValue`       | Debounce a changing value to a fixed delay                                                                       |
| `useThrottledValue`       | Throttle value updates to a fixed interval; alias: `useThrottle`                                                 |
| `useThrottledCallback`    | Throttle a callback to a fixed interval                                                                          |
| `useTimeout`              | Run a callback once after a delay; returns `{ reset, clear }` (`null` pauses)                                    |
| `useInterval`             | Run a callback on an interval (`null` pauses)                                                                    |
| `useRecursiveTimeout`     | Recursively schedule async/sync callbacks                                                                        |
| `useMergedRef`            | Merge multiple object/callback refs into one callback ref                                                        |
| `useImage`                | Preload an image and expose `loading`/`error` (an `Error`)/`loaded`/`attemptCount`/`retry`                       |

## Migrating from v2

v3.0.0 is a major release with several breaking changes. See the
[Migration Guide](./MIGRATION.md) for before/after examples.

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
│   ├── use-history-state.ts
│   ├── use-image.ts
│   ├── use-intersection-observer.ts
│   ├── use-local-storage.ts
│   ├── use-multi-select.ts
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

Releases are fully automated via [changesets](https://github.com/changesets/changesets):

- Each PR against `main` gets an AI-drafted changeset file describing its change.
- Once changesets accumulate on `main`, a "Version Packages" PR bumps `package.json`'s version and consolidates `CHANGELOG.md`.
- Merging that PR builds, publishes to npm, and tags the release.

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
