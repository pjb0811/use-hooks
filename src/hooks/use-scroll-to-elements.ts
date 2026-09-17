import { type RefObject, useCallback, useEffect, useRef } from 'react';

type ElementKey = string;

type ScrollContainer = HTMLElement | RefObject<HTMLElement | null> | null;

interface Options extends ScrollIntoViewOptions {
  offset?: number;
  // Explicit scroll container for the `offset` path, for the cases where the
  // automatic lookup below can't pick the right one — e.g. a container that
  // isn't an ancestor of the target, or one that only becomes scrollable
  // later. Leave it unset and the nearest scrollable ancestor is used, with
  // `window` as the final fallback.
  container?: ScrollContainer;
}

const resolveContainer = (container: ScrollContainer): HTMLElement | null => {
  if (!container) {
    return null;
  }
  return 'current' in container ? container.current : container;
};

// `overlay` is a legacy alias of `auto` that still shows up in older WebKit.
// `hidden` is deliberately excluded: it is programmatically scrollable, but an
// author who wrote `overflow: hidden` is describing a clipped box, not a
// scroller, so moving it would be the surprising choice here.
const isScrollable = (element: HTMLElement) => {
  const { overflowY } = getComputedStyle(element);

  return (
    (overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflowY === 'overlay') &&
    element.scrollHeight > element.clientHeight
  );
};

// The no-offset path hands the work to `scrollIntoView`, which finds the
// nearest scrollable ancestor by itself. The offset path can't use it (see the
// comment in `scrollTo`), so it has to repeat that lookup — otherwise passing
// `offset` would silently switch the scroll from the element's own container
// to `window`, which is never what the call site means.
const findScrollableAncestor = (element: HTMLElement): HTMLElement | null => {
  let parent = element.parentElement;

  while (
    parent &&
    parent !== document.body &&
    parent !== document.documentElement
  ) {
    if (isScrollable(parent)) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return null;
};

const useScrollToElements = (defaultOptions?: Options) => {
  const elementsRef = useRef(new Map<ElementKey, HTMLElement>());
  const registerCallbacksRef = useRef(
    new Map<ElementKey, (node: HTMLElement | null) => void>(),
  );

  // `defaultOptions` is almost always an inline object literal at the call
  // site, so depending on it directly would recreate `scrollTo` on every
  // render — read the latest value from a ref instead.
  const defaultOptionsRef = useRef(defaultOptions);

  useEffect(() => {
    defaultOptionsRef.current = defaultOptions;
  });

  // Returns a stable callback per key so React doesn't detach/reattach the
  // ref (and thrash the Map) on every render — only a genuine unmount
  // (node === null) removes the entry.
  const register = useCallback((key: ElementKey) => {
    let callback = registerCallbacksRef.current.get(key);

    if (!callback) {
      callback = (node: HTMLElement | null) => {
        if (node) {
          elementsRef.current.set(key, node);
        } else {
          elementsRef.current.delete(key);
        }
      };
      registerCallbacksRef.current.set(key, callback);
    }

    return callback;
  }, []);

  const scrollTo = useCallback((key: ElementKey, options?: Options) => {
    const element = elementsRef.current.get(key);

    if (!element) {
      return;
    }

    const { offset, container, ...scrollIntoViewOptions } = {
      ...defaultOptionsRef.current,
      ...options,
    };

    // With an offset, `scrollIntoView` and `scrollTo` would both animate
    // the same scroll, fighting each other and settling in the wrong
    // place — use `scrollTo` alone, computed from the element's position
    // before any scrolling starts (not after `scrollIntoView`, where the
    // rect would reflect a mid-animation position).
    if (offset != null) {
      const containerElement =
        resolveContainer(container ?? null) ?? findScrollableAncestor(element);

      if (containerElement) {
        const containerRect = containerElement.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const top =
          containerElement.scrollTop +
          (elementRect.top - containerRect.top) -
          offset;

        containerElement.scrollTo({
          top,
          behavior: scrollIntoViewOptions.behavior || 'smooth',
        });
        return;
      }

      const top = element.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top,
        behavior: scrollIntoViewOptions.behavior || 'smooth',
      });
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'start',
      ...scrollIntoViewOptions,
    });
  }, []);

  return { register, scrollTo };
};

export default useScrollToElements;
