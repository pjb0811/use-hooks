import { type RefObject, useEffect, useRef, useState } from 'react';

import useAnimationFrameCallback from './use-animation-frame-callback';
import useLatest from './use-latest';

type ElementReference<T> = string | RefObject<T> | (() => T | null);

interface Options<T> {
  // Returns the rect to track for the element. Defaults to the element's
  // `getBoundingClientRect()`.
  measure?: (element: T) => DOMRect | null;
}

const rectsEqual = (a: DOMRect | null, b: DOMRect | null) => {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.width === b.width &&
    a.height === b.height &&
    a.top === b.top &&
    a.left === b.left
  );
};

// Tracks the rect of an element given as a ref, a CSS selector, or a getter.
// A selector or getter is evaluated on every measurement, so the target can
// change; a getter is also measured after every render, so changes to its
// inputs are picked up without a scroll or resize. `measure` replaces
// `getBoundingClientRect()`, for rects in another coordinate space. The latest
// getter and `measure` are read through refs, so inline functions don't
// re-attach the listeners.
const useElementPosition = <T>(
  elementRef: ElementReference<T>,
  options: Options<T> = {},
) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const elementRefLatest = useLatest(elementRef);
  const measureOptionRef = useLatest(options.measure);
  const isGetter = typeof elementRef === 'function';
  // A getter is read through `elementRefLatest`; only a ref or selector
  // identifies the target to re-subscribe for.
  const target = isGetter ? null : elementRef;
  const rectRef = useRef<DOMRect | null>(null);
  const measureRef = useRef<() => void>(() => {});

  // A burst of scroll, resize and DOM events measures once per frame.
  const [scheduleUpdate, cancelUpdate] = useAnimationFrameCallback(() =>
    measureRef.current(),
  );

  useEffect(() => {
    const getElement = (): T | null => {
      const ref = elementRefLatest.current;

      if (typeof ref === 'string') {
        return document.querySelector(ref) as T | null;
      }
      if (typeof ref === 'function') {
        return ref();
      }
      return ref.current;
    };

    let currentElement: HTMLElement | null = null;

    const commitRect = (next: DOMRect | null) => {
      if (rectsEqual(rectRef.current, next)) {
        return;
      }
      rectRef.current = next;
      setRect(next);
    };

    // ResizeObserver only fires for the observed element's own size/layout
    // changes, so it's kept pointed at whichever element is actually
    // current — which can change under a string selector, or if the DOM
    // node behind a ref gets swapped out.
    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => updateRect())
        : undefined;

    function updateRect() {
      const element = getElement();
      const observed = element as HTMLElement | null;

      if (observed !== currentElement) {
        if (currentElement) {
          resizeObserver?.unobserve(currentElement);
        }
        if (observed) {
          resizeObserver?.observe(observed);
        }
        currentElement = observed;
      }

      if (!element) {
        commitRect(null);

        return;
      }

      const measure = measureOptionRef.current;

      commitRect(
        measure
          ? measure(element)
          : (observed as HTMLElement).getBoundingClientRect(),
      );
    }

    measureRef.current = updateRect;

    const onUpdate = () => {
      scheduleUpdate();
    };

    updateRect();

    // `capture: true` also catches scroll events from scrollable ancestor
    // containers, which don't bubble and so wouldn't otherwise reach a
    // listener on `window`.
    window.addEventListener('scroll', onUpdate, {
      passive: true,
      capture: true,
    });
    window.addEventListener('resize', onUpdate, { passive: true });

    // A selector's or getter's target may not exist yet when this effect
    // first runs — watch the DOM for it instead of leaving `rect` permanently
    // null once it does mount.
    const mutationObserver =
      (typeof target === 'string' || isGetter) &&
      typeof MutationObserver !== 'undefined'
        ? new MutationObserver(onUpdate)
        : undefined;
    mutationObserver?.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      cancelUpdate();
      measureRef.current = () => {};
      window.removeEventListener('scroll', onUpdate, { capture: true });
      window.removeEventListener('resize', onUpdate);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [
    target,
    isGetter,
    elementRefLatest,
    measureOptionRef,
    scheduleUpdate,
    cancelUpdate,
  ]);

  // A getter's inputs can change without any scroll or resize, so measure
  // after each render; unchanged rects are dropped by `commitRect`.
  useEffect(() => {
    if (isGetter) {
      measureRef.current();
    }
  });

  return rect;
};

export default useElementPosition;
