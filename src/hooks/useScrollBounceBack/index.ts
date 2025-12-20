import { useEffect, useRef } from 'react';

import useWindowScroll from '../useWindowScroll';

interface Options {
  enabled?: boolean;
  useWheel?: boolean;
  debounceDelay?: number;
  threshold?: number;
}

const useScrollBounceBack = (options: Options = {}) => {
  const {
    enabled = true,
    useWheel = false,
    debounceDelay = 150,
    threshold = 100,
  } = options;

  const { percent } = useWindowScroll();

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const maxScrollPosition = useRef<number>(0);
  const isTouching = useRef<boolean>(false);
  const isAnimating = useRef<boolean>(false);
  const hasReachedThreshold = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    maxScrollPosition.current = window.scrollY;
    hasReachedThreshold.current = false;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (percent.y >= threshold) {
      hasReachedThreshold.current = true;
    } else if (!hasReachedThreshold.current && !isAnimating.current) {
      const currentScrollY = window.scrollY;
      if (currentScrollY > maxScrollPosition.current) {
        maxScrollPosition.current = currentScrollY;
      }
    }

    const bounceBack = () => {
      if (!isTouching.current && !isAnimating.current) {
        isAnimating.current = true;

        window.scrollTo({
          top: maxScrollPosition.current,
          behavior: 'smooth',
        });

        setTimeout(() => {
          isAnimating.current = false;
        }, 500);
      }
    };

    const onTouchStart = () => {
      isTouching.current = true;
      isAnimating.current = false;

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };

    const onTouchEnd = () => {
      isTouching.current = false;

      if (percent.y >= threshold) {
        debounceTimer.current = setTimeout(bounceBack, debounceDelay);
      }
    };

    const onTouchCancel = () => {
      isTouching.current = false;

      if (percent.y >= threshold) {
        debounceTimer.current = setTimeout(bounceBack, debounceDelay);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (percent.y >= threshold && e.deltaY > 0) {
        e.preventDefault();
      }
    };

    const onScroll = () => {
      if (isTouching.current || isAnimating.current) {
        return;
      }

      if (percent.y >= threshold) {
        debounceTimer.current = setTimeout(bounceBack, debounceDelay);
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('touchcancel', onTouchCancel, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    if (useWheel) {
      window.addEventListener('wheel', onWheel, { passive: false });
    }

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchCancel);
      window.removeEventListener('scroll', onScroll);

      if (useWheel) {
        window.removeEventListener('wheel', onWheel);
      }

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [percent.y, enabled, useWheel, debounceDelay, threshold]);
};

export default useScrollBounceBack;
