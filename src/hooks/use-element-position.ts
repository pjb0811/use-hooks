import { type RefObject, useEffect, useRef, useState } from 'react';

type ElementReference<T> = string | RefObject<T>;

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

const useElementPosition = <T>(elementRef: ElementReference<T>) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const getElement = (ref: ElementReference<T>): T | null => {
      if (typeof ref === 'string') {
        return document.querySelector(ref) as T | null;
      }
      return ref.current;
    };

    let rafId: number | undefined;
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
      const element = getElement(elementRef) as HTMLElement | null;

      if (element !== currentElement) {
        if (currentElement) {
          resizeObserver?.unobserve(currentElement);
        }
        if (element) {
          resizeObserver?.observe(element);
        }
        currentElement = element;
      }

      commitRect(element ? element.getBoundingClientRect() : null);
    }

    const onUpdate = () => {
      rafId = requestAnimationFrame(updateRect);
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

    // A string selector's target may not exist yet when this effect first
    // runs — watch the DOM for it instead of leaving `rect` permanently
    // null once it does mount.
    const mutationObserver =
      typeof elementRef === 'string' && typeof MutationObserver !== 'undefined'
        ? new MutationObserver(onUpdate)
        : undefined;
    mutationObserver?.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onUpdate, { capture: true });
      window.removeEventListener('resize', onUpdate);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [elementRef]);

  return rect;
};

export default useElementPosition;
