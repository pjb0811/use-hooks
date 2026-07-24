import { useCallback, useEffect, useState } from 'react';

interface ScrollPosition {
  scrollY: number;
  scrollPercentage: number;
  isAtTop: boolean;
  isAtBottom: boolean;
  scrollableHeight: number;
  clientHeight: number;
  scrollHeight: number;
}

const useElementScroll = () => {
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

  const setRef = useCallback((el: HTMLElement | null) => {
    setElement(el);
  }, []);

  useEffect(() => {
    if (!element) {
      return;
    }

    const updateScrollPosition = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const scrollableHeight = scrollHeight - clientHeight;

      if (scrollableHeight <= 0) {
        setScrollPosition({
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

      setScrollPosition({
        scrollY: scrollTop,
        scrollPercentage: percentage,
        isAtTop: scrollTop <= 0,
        isAtBottom: scrollTop >= scrollableHeight - 1,
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

    resizeObserver.observe(element);

    return () => {
      element.removeEventListener('scroll', onScroll);
      resizeObserver.unobserve(element);
    };
  }, [element]);

  return { ...scrollPosition, element, setRef };
};

export default useElementScroll;
