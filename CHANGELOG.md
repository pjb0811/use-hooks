# Changelog

## 2.11.0

### Minor Changes

- 934163e: Added support for curved-easing steps and improved performance by memoizing derived values and clearing applied styles on unmount.
- 2611ebf: Added support for tracking scroll position and viewport size of a specific element, allowing for more accurate and flexible use of the `useWindowScroll` hook.
- f3d2c8d: The `useElementPosition` hook now supports string selectors and handles cases where the target element may not exist yet when the hook first runs, or where the DOM node behind a ref gets swapped out.
- e2f7d69: Added support for range selection in the useMultiSelect hook, allowing users to select multiple items by holding down the shift key and clicking on a range of indices.
- f9e6857: The `useElementScroll` hook now accepts an optional `threshold` option to customize the 'at bottom' detection, and it also observes child elements and their size changes to accurately track scroll positions.
- 1e91121: A new `useControllableState` hook with improved behavior and warnings for switching between controlled and uncontrolled modes has been added.
- 10163cd: Add support for measuring the viewport instead of an element/document.body, useful when no container/ref is attached and the breakpoint should reflect the viewport rather than document.body's box.

## 2.10.0

### Minor Changes

- 6ca529a: Add support for scrolling to elements with an offset from the top of the viewport.
- 0133b47: Add `takeLast` and `takeFirst` functions to handle edge cases for history state truncation, allowing for more robust handling of undo/redo limits.
- db4a95b: Add a new `useBodyScrollLock` hook with improved iOS support, using a Set of per-instance tokens instead of a raw counter to prevent drift in the lock count.

## 2.9.0

### Minor Changes

- 43c4420: Add a new `leading` option to `useDebounce` to control whether the first invocation fires immediately or after the specified delay.
- 1e2d465: useViewport now returns a fresh, plain-object snapshot of the viewport on every read, rather than the mutable window.visualViewport instance, to ensure accurate re-renders on changes.
- 24d1299: useLocalStorage now supports same-tab sync for shared cache and subscriber lists, enabling seamless updates across related components in the same tab.
- 77aba46: Add a new `stopOnError` option to `useRecursiveTimeout` to control whether a rejected callback stops the polling loop or schedules the next tick.

## 2.8.0

### Minor Changes

- bc0779b: Add the useControllableState hook to support both controlled and uncontrolled component state patterns seamlessly.
- 895e8ae: Add a `targetRef` option to `useWindowScroll` to allow tracking of scroll position within an iframe or other nested window.

## 2.7.0

### Minor Changes

- 926b366: Add a new hook useMultiSelect for checkbox-style multi-selection with shift-click range selection.
- 926b366: Add `useMultiSelect`: checkbox-style multi-select for a list, with shift-click range selection. Selection is clamped against the current item count (via `useMemo`, not an effect) so it stays valid as the backing list shrinks or grows.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2.6.0

### Minor Changes

- 9d1cba1: Add a new hook useFileToDataUrl to read a File as a data URL using FileReader.

## 2.5.0

### Minor Changes

- 7fd35a9: Add a new hook useIntersectionObserver to track element visibility in the viewport using the IntersectionObserver API.

## 2.4.0

### Minor Changes

- 0913c44: Add a GitHub navigation link to the demo layout.
- 6d09947: Add a theme toggle feature to the demo application, allowing users to switch between light and dark themes.
- 17e3879: Add a useEffect hook to update the document title based on the current route in the application.
- 27603b2: Replace SVG icons with Radix UI icons for theme toggle and GitHub link.
- 1e37318: Add support for dark mode by toggling the 'dark' class on the document element based on the theme.
- 4c1e6e6: Add a new hook useHistoryState for managing state with undo/redo support.

### Patch Changes

- 313b12a: Update demo components to improve layout and styling for better responsiveness.
- a72c804: Update styles for demo components to improve layout and spacing.

## 2.3.0

### Minor Changes

- add cross-tab synchronization to useLocalStorage via the storage event
- add useClickOutside hook
- add ClickOutsideDemo component
- add one file per hook pattern for better organization
- add demo file naming convention for consistency

### Patch Changes

- rename hook directories to kebab-case (e.g. useScrollToElements -> use-scroll-to-elements); hook export names remain camelCase
- update README to reflect 13 hooks
- change demo imports to match new file naming convention
- fix a race condition in useImage where a stale image load or pending retry timer could overwrite state after src changed or the component unmounted
- fix useScrollToElements to release refs to unmounted elements instead of holding stale DOM nodes
- fix useBodyScrollLock to ref-count nested locks (e.g. stacked modals) so styles restore correctly regardless of unmount order, and compensate for scrollbar width to avoid layout shift
- fix useTimeline to cancel a pending requestAnimationFrame on cleanup, preventing a stale callback from mutating the DOM after an effect was cleaned up
- fix useLocalStorage to use the current initialValue instead of a stale one captured at first mount when seeding a newly-changed key

## 2.2.0

### Minor Changes

- Add useTimeline hook and export it from hooks index.

## 2.1.0

### Minor Changes

- Add useThrottle hook.

### Patch Changes

- Switch package output to ESM-only.
- Refresh documentation to match current hooks and build outputs.

## 2.0.2

### Patch Changes

- Improve element reference handling in useResponsiveSize.

## 2.0.1

### Patch Changes

- Update hooks count and add useDebounce description in README.

## 2.0.0

### Major Changes

- Simplify autoInvoke logic in useDebounce.

## 1.1.3

### Patch Changes

- Align function name with folder name (useResponsiveSize).

## 1.1.2

### Patch Changes

- Update bilingual README and add language selector.

## 1.1.1

### Patch Changes

- Migrate from npm to pnpm with lock file generation.
- Add GitHub Actions workflows (CI, publish, release, docs deploy).
- Establish commit message conventions (Korean/English).
- Update prettier and development dependencies.
- Improve package.json with English description.

## 1.1.0

### Minor Changes

- Add delay and container options to useElementSize hook.
