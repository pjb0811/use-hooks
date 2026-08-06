import { useCallback, useEffect, useRef, useState } from 'react';

interface ScrollPosition {
  scrollY: number;
  scrollPercentage: number;
  isAtTop: boolean;
  isAtBottom: boolean;
  scrollableHeight: number;
  clientHeight: number;
  scrollHeight: number;
}

const scrollPositionEqual = (a: ScrollPosition, b: ScrollPosition) =>
  a.scrollY === b.scrollY &&
  a.scrollPercentage === b.scrollPercentage &&
  a.isAtTop === b.isAtTop &&
  a.isAtBottom === b.isAtBottom &&
  a.scrollableHeight === b.scrollableHeight &&
  a.clientHeight === b.clientHeight &&
  a.scrollHeight === b.scrollHeight;

interface Options {
  // How close to the bottom (in px) still counts as "at bottom". Matches
  // the previous hardcoded value by default.
  threshold?: number;
}

const useElementScroll = ({ threshold = 1 }: Options = {}) => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    scrollY: 0,
    scrollPercentage: 0,
    isAtTop: true,
    isAtBottom: false,
    scrollableHeight: 0,
    clientHeight: 0,
    scrollHeight: 0,
  });
  const scrollPositionRef = useRef(scrollPosition);

  const setRef = useCallback((el: HTMLElement | null) => {
    setElement(el);
  }, []);

  useEffect(() => {
    if (!element) {
      return;
    }

    const commit = (next: ScrollPosition) => {
      if (scrollPositionEqual(scrollPositionRef.current, next)) {
        return;
      }
      scrollPositionRef.current = next;
      setScrollPosition(next);
    };

    const updateScrollPosition = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const scrollableHeight = scrollHeight - clientHeight;

      if (scrollableHeight <= 0) {
        commit({
          scrollY: 0,
          scrollPercentage: 0,
          isAtTop: true,
          isAtBottom: true,
          scrollableHeight: 0,
          clientHeight,
          scrollHeight,
        });
        return;
      }

      const percentage = Math.min(
        100,
        Math.max(0, (scrollTop / scrollableHeight) * 100),
      );

      commit({
        scrollY: scrollTop,
        scrollPercentage: percentage,
        isAtTop: scrollTop <= 0,
        isAtBottom: scrollTop >= scrollableHeight - threshold,
        scrollableHeight,
        clientHeight,
        scrollHeight,
      });
    };

    updateScrollPosition();

    const onScroll = () => {
      updateScrollPosition();
    };

    element.addEventListener('scroll', onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      updateScrollPosition();
    });

    // Observing only the container misses content that grows/shrinks
    // `scrollHeight` without resizing the container's own box (a list
    // gaining items, an image finishing its load) — also watch every
    // child so their own size changes are caught.
    const observeChildren = () => {
      resizeObserver.observe(element);
      Array.from(element.children).forEach(child => {
        resizeObserver.observe(child);
      });
    };

    observeChildren();

    // Catches children being added/removed (re-syncs which elements the
    // ResizeObserver above watches, and recalculates immediately) —
    // ResizeObserver alone doesn't see brand new children until this runs.
    const mutationObserver = new MutationObserver(() => {
      observeChildren();
      updateScrollPosition();
    });
    mutationObserver.observe(element, { childList: true, subtree: true });

    return () => {
      element.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [element, threshold]);

  return { ...scrollPosition, element, setRef };
};

export default useElementScroll;
