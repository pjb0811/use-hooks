import { useCallback, useEffect, useState } from 'react';

type ViewportInfo =
  | VisualViewport
  | {
      width: number;
      height: number;
      offsetLeft: number;
      offsetTop: number;
      pageLeft: number;
      pageTop: number;
      scale: number;
    };

interface UseViewportOptions {
  isInApp?: boolean;
  debounce?: number;
}

const useViewport = (options: UseViewportOptions = {}) => {
  const { isInApp = false, debounce = 100 } = options;

  const [viewport, setViewport] = useState<ViewportInfo>({
    width: 0,
    height: 0,
    offsetLeft: 0,
    offsetTop: 0,
    pageLeft: 0,
    pageTop: 0,
    scale: 1,
  });

  const getAppViewHeight = useCallback(() => {
    const windowHeight = window.innerHeight;
    const visualHeight = window.visualViewport?.height || windowHeight;
    const documentHeight = document.documentElement.clientHeight;
    const bodyHeight = document.body.clientHeight;

    if (window.visualViewport && Math.abs(visualHeight - windowHeight) > 100) {
      return visualHeight;
    }

    return Math.max(windowHeight, documentHeight, bodyHeight);
  }, []);

  const readViewport = useCallback((): ViewportInfo => {
    if (window.visualViewport && !isInApp) {
      return window.visualViewport;
    }

    const width = window.visualViewport?.width || window.innerWidth;
    const height = isInApp
      ? getAppViewHeight()
      : window.visualViewport?.height || window.innerHeight;

    return {
      width,
      height,
      offsetLeft: window.visualViewport?.offsetLeft || 0,
      offsetTop: window.visualViewport?.offsetTop || 0,
      pageLeft: window.scrollX ?? window.pageXOffset ?? 0,
      pageTop: window.scrollY ?? window.pageYOffset ?? 0,
      scale: window.visualViewport?.scale || 1,
    };
  }, [isInApp, getAppViewHeight]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setViewport(readViewport());
      }, debounce);
    };

    const immediateUpdate = () => setViewport(readViewport());

    immediateUpdate();

    const events = ['resize', 'orientationchange'];

    if (isInApp) {
      events.push('focus', 'blur', 'touchstart', 'touchend');
    }

    events.forEach(event => {
      if (event === 'resize' || event === 'orientationchange') {
        window.addEventListener(event, debouncedUpdate);
      } else {
        window.addEventListener(event, immediateUpdate, { passive: true });
      }
    });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', immediateUpdate);
      window.visualViewport.addEventListener('scroll', immediateUpdate);
    }

    let intervalId: NodeJS.Timeout;
    if (isInApp) {
      let lastHeight = readViewport().height;
      intervalId = setInterval(() => {
        const currentHeight = readViewport().height;
        if (Math.abs(currentHeight - lastHeight) > 50) {
          lastHeight = currentHeight;
          immediateUpdate();
        }
      }, 500);
    }

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);

      events.forEach(event => {
        window.removeEventListener(
          event,
          event === 'resize' || event === 'orientationchange'
            ? debouncedUpdate
            : immediateUpdate,
        );
      });

      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', immediateUpdate);
        window.visualViewport.removeEventListener('scroll', immediateUpdate);
      }
    };
  }, [readViewport, isInApp, debounce]);

  return viewport;
};

export default useViewport;
