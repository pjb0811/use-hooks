---
sidebar_position: 1
title: Overview
---

# use-hooks

A collection of reusable React 19 hooks for common UI and interaction
patterns. Built with TypeScript, optimized for both server-side rendering
and client-side applications. The published package has zero runtime
dependencies of its own.

## Install

```bash
npm install @jbpark/use-hooks
```

## Quick start

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

## Hooks by category

Each page below has a live, interactive demo for every hook in that group.

| Page                                                       | Hooks                                                                                                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [State](./hooks/state.mdx)                                 | `useLocalStorage`, `useHistoryState`, `useControllableState`, `usePrevious`, `useToggle`, `useMultiSelect`                                  |
| [Scroll & Position](./hooks/scroll-and-position.mdx)       | `useWindowScroll`, `useElementScroll`, `useElementPosition`, `useResponsiveSize`, `useViewport`, `useScrollToElements`, `useBodyScrollLock` |
| [Observers](./hooks/observers.mdx)                         | `useIntersectionObserver`, `useResizeObserver`, `useMutationObserver`                                                                       |
| [Events & Interaction](./hooks/events-and-interaction.mdx) | `useEventListener`, `useClickOutside`, `useKeyPress`, `useFileDrop`, `useFileToDataUrl`                                                     |
| [Timing](./hooks/timing.mdx)                               | `useDebounce`, `useDebouncedValue`, `useThrottle`, `useThrottledCallback`, `useTimeout`, `useInterval`, `useRecursiveTimeout`               |
| [Utility](./hooks/utility.mdx)                             | `useMergedRef`, `useImage`                                                                                                                  |

## Links

- [GitHub](https://github.com/pjb0811/use-hooks)
- [npm](https://www.npmjs.com/package/@jbpark/use-hooks)
