# Changelog

## 4.0.0

### Major Changes

- 28bd1ca: `useClickOutside`'s `escape` option now defaults to `false` (previously `true`). This is a behavior change for any caller relying on the 3.0.0 default: Escape no longer closes the referenced element(s) unless you pass `escape: true` explicitly.

### Minor Changes

- a82b668: Added retry logic for attaching event listeners to null targets, ensuring they are attached as soon as the target is available.
- 663926f: Add human-friendly key aliases to `use-key-press` hook, allowing callers to write `'space'` instead of a literal `' '` or `'esc'` for Escape.
- 528358f: Add support for function refs that return their own cleanup, improving compatibility with React 19.
- 0f09c15: Add support for custom box sizing to the useResizeObserver hook, allowing users to observe the border-box or content-box size of an element.
- 3af2f10: Add symmetric naming across debounce/throttle family, deprecate useDebounce and useThrottle in favor of useDebouncedCallback and useThrottledValue

## 3.0.0

### Major Changes

- 398a0e0: `useImage`'s `error` is now a real `Error` instead of `string | Event | null` — the `string` branch was never actually set (a leftover from `OnErrorEventHandler`'s type, not real behavior), and a bare `Event` carries no useful failure reason. The original event is attached as `error.cause` if you need it.

  Also exposes `attemptCount` (previously internal-only state) for building retry UI.

  ```ts
  // before
  const { loading, error, loaded, retry } = useImage(src, { retryCount: 1 });
  // error: string | Event | null
  
  // after
  const { loading, error, loaded, retry, attemptCount } = useImage(src, {
    retryCount: 1,
  });
  // error: Error | null, error.message is a real description, error.cause is the original event
  ```

- 175cc8d: Removed `useTimeline`. It had zero consumers across both apps that depend on this library, was by far the largest hook (self-contained animation DSL driving inline styles via DOM selectors, plus a global, irreversible `CSS.registerProperty` registration), and duplicated capabilities already covered by GSAP/motion in those apps. If you were importing it directly, pin to `2.x` or bring the implementation into your own project.
- b1a3f99: Redesigned `useScrollToElements`'s API from index-based registration (`elementRefs`/`setElementRef(el, index)`/`scrollToElement(index)`) to key-based (`register(key)`/`scrollTo(key, options)`):
  - String keys instead of array indices — no more mismatches when a list is reordered/filtered, and no leftover `null` holes when an item is removed (registration is now a `Map`, cleaned up automatically on unmount).
  - `elementRefs` is no longer exposed — it was a leaked implementation detail.
  - Options can now be passed per-call to `scrollTo`, not just once at the hook level.
  - The `offset` scroll path no longer assumes `window` is the scrolling container — pass `container` (an element or ref) to scroll a modal's own scrollable body, an iframe's body, etc. instead.

  ```ts
  // before
  const { setElementRef, scrollToElement } = useScrollToElements({ offset: 16 });
  <div ref={el => setElementRef(el, index)} />;
  scrollToElement(index);
  
  // after
  const { register, scrollTo } = useScrollToElements({ offset: 16 });
  <div ref={register('section-1')} />;
  scrollTo('section-1');
  ```

- f75d003: Redesigned `useClickOutside` to take the "inside" ref(s) as an argument instead of creating and returning one:
  - Accepts a single ref or an array of refs — lets you exclude both a trigger element and a separately-mounted panel (e.g. a portaled dropdown/popover), which fixes the classic bug where clicking the trigger to close something re-opens it because the trigger itself registers as an "outside" click.
  - Switched the default listened event from `mousedown` + `touchstart` (which can double-fire a handler on touch devices) to `pointerdown` alone; still configurable via the new `events` option.
  - Added an `escape` option (default `true`) to also close on the Escape key.

  ```ts
  // before
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);
  <div ref={ref} />
  
  // after
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useClickOutside([triggerRef, panelRef], () => setOpen(false), { enabled: open });
  <button ref={triggerRef} />
  <div ref={panelRef} />
  ```

- d851c93: Redesigned `useIntersectionObserver`'s return shape and added missing capabilities:
  - Returns `[ref, { entry, isIntersecting }]` instead of `[ref, entry]` — nearly every consumer only read `entry?.isIntersecting` anyway (ui-kit's infinite scroll included).
  - Added `freezeOnceVisible` — disconnects for good the first time the target becomes intersecting, covering the common "seen once, that's enough" case (lazy loading, entrance animations, infinite-scroll triggers) that previously needed the consumer to track their own "already fired" flag.
  - `options` (threshold/rootMargin/root) is now actually reactive — previously captured once and never reconnected, so it could never be changed at runtime despite looking like a normal prop.

  ```ts
  // before
  const [ref, entry] = useIntersectionObserver({ threshold: 0.5 });
  entry?.isIntersecting;
  
  // after
  const [ref, { isIntersecting }] = useIntersectionObserver({
    threshold: 0.5,
    freezeOnceVisible: true,
  });
  ```

### Minor Changes

- 43f5a21: Added `useDebouncedValue(value, delay)` and `useThrottledCallback(callback, delay, options)`, rounding out the value/callback pairing for both debounce and throttle:
  - `useDebouncedValue` is the value-shaped counterpart to `useDebounce` (which is callback-shaped), symmetric with `useThrottle`'s `(value, delay) => value` signature — the common "just give me the debounced value" case previously needed two pieces of state and an effect built on `useDebounce` by hand.
  - `useThrottledCallback` throttles a callback directly instead of a value, with `leading`/`trailing` options (both default `true`).
  - `useThrottle` also gains the same optional `leading`/`trailing` options (defaulting to its existing fixed behavior) — it's now implemented on top of `useThrottledCallback` internally instead of duplicating the same windowing logic a second time.

- a28a574: Added `useEventListener`, `usePrevious`, and `useToggle` — following the issue's recommended order (these first since the other small-utility candidates, `useForceUpdate`/`useIsMounted`, don't build on them the way the rest of this library does).

  ```ts
  useEventListener('resize', () => setWidth(window.innerWidth));
  useEventListener('error', onError, { target: window, capture: true });
  
  const previous = usePrevious(value);
  
  const [open, toggle, setOpen] = useToggle(false);
  ```

  - `useEventListener` resolves `target` (default `window`, or a `RefObject`/raw `EventTarget`) and (de)registers the listener — the addEventListener/removeEventListener pair duplicated across ui-kit (marquee item) and live-editor (error handlers). Handler is read through a ref so a fresh function every render doesn't tear down and re-add it.
  - `usePrevious` returns the value from the previous render, for comparisons like detecting a false-to-true transition.
  - `useToggle` is the boolean-toggle-with-a-direct-setter shape ui-kit's dropdown/collapse/drawer/modal all reimplement.

- f6df4cb: Added `useFileDrop`, pairing with `useFileToDataUrl` to cover a drag-and-drop upload area end to end:

  ```ts
  const { dropRef, isDragging } = useFileDrop({
    onDrop: files => addFiles(files),
    accept: 'image/*',
    multiple: true,
    disabled,
  });
  ```

  - `isDragging` is tracked with an enter/leave counter rather than a plain boolean, since `dragleave` also fires when the pointer moves onto a child element — a plain boolean would flicker `isDragging` off and back on as the pointer crosses child boundaries.
  - `accept` filters dropped files using the same format as the native `<input accept>` attribute (extensions, MIME types, or wildcard subtypes like `image/*`).
  - `multiple: false` truncates to the first accepted file.

- e748350: Added `useKeyPress`, binding a key combo to a handler:

  ```ts
  useKeyPress('Escape', () => setOpen(false));
  useKeyPress(['Enter', ' '], handleSelect, { preventDefault: true });
  useKeyPress('mod+z', undo, { ignore: '.cm-editor' });
  ```

  - Accepts a single combo or an array, e.g. `'mod+shift+z'` or `['Enter', ' ']`. `mod` normalizes to Cmd on macOS / Ctrl elsewhere.
  - Modifiers not named in a combo are required to be _absent_, not just ignored, so `'mod+z'` and `'mod+shift+z'` registered as separate bindings only ever fire one of them for a given keypress.
  - `target` (default `window`), `enabled`, `preventDefault`, and `ignore` (a CSS selector — skip keydowns whose target is inside a matching element, e.g. a code editor with its own undo) options.

- 80cf67b: Added `useMergedRef`, merging any number of refs (forwarded function refs, `RefObject`s, or `null`/`undefined`) into a single callback ref. Handles React 19's optional per-ref cleanup return value.
- cac1a83: Added `useResizeObserver` and `useMutationObserver`.

  `useResizeObserver` returns a `[ref, size]` tuple (same convention as `useIntersectionObserver`) reporting an element's own width/height — the unprocessed primitive behind `useResponsiveSize`/`useElementScroll`/`useElementPosition`, which each shape the value for their own purpose instead of exposing it directly.

  `useMutationObserver(target, callback, options)` takes its target directly — a `RefObject`, or a plain `Node` like `document.head` that isn't behind any React ref — and reads `callback` through a ref so passing a fresh inline function every render doesn't tear down and resubscribe the observer.

- 081e563: Added `useTimeout` and `useInterval` — the basic single-shot and repeating timer hooks this library was missing (only the polling-oriented `useRecursiveTimeout` existed before).

  Both treat `delay === null` as "inactive" and `0` as a valid delay, same rule `useRecursiveTimeout` follows — a bare `if (!delay)` guard is the classic bug this exists to avoid, since it silently no-ops for a delay of `0` too. Both read their callback through a ref, so a fresh function every render doesn't reset the timer.

  ```ts
  const { reset, clear } = useTimeout(() => setOpen(false), open ? 2000 : null);
  useInterval(() => setCount(c => c + 1), running ? 1000 : null);
  ```

  `useTimeout` additionally returns `reset`/`clear` for imperative control — e.g. pausing a toast's auto-dismiss while hovered, then restarting it on mouse leave.

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
