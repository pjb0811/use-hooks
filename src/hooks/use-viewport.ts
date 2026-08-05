import { useCallback, useEffect, useState } from 'react';

interface ViewportInfo {
  width: number;
  height: number;
  offsetLeft: number;
  offsetTop: number;
  pageLeft: number;
  pageTop: number;
  scale: number;
}

const viewportEqual = (a: ViewportInfo, b: ViewportInfo) =>
  a.width === b.width &&
  a.height === b.height &&
  a.offsetLeft === b.offsetLeft &&
  a.offsetTop === b.offsetTop &&
  a.pageLeft === b.pageLeft &&
  a.pageTop === b.pageTop &&
  a.scale === b.scale;

interface Options {
  isInApp?: boolean;
  debounce?: number;
}

const useViewport = (options: Options = {}) => {
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

  // Always builds a fresh plain-object snapshot rather than returning
  // `window.visualViewport` itself — that instance is a single mutable
  // object the browser updates in place, so returning it directly meant
  // every read produced the exact same reference and `setViewport` never
  // saw a change (no re-render, ever).
  const readViewport = useCallback((): ViewportInfo => {
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
    let timeoutId: ReturnType<typeof setTimeout>;

    // Snapshots are freshly-allocated objects on every read, so gate the
    // state update on an actual value change instead of always replacing
    // the reference — otherwise every resize/scroll tick would re-render
    // consumers even when nothing visibly moved.
    const commitViewport = (next: ViewportInfo) => {
      setViewport(prev => (viewportEqual(prev, next) ? prev : next));
    };

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        commitViewport(readViewport());
      }, debounce);
    };

    const immediateUpdate = () => commitViewport(readViewport());

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

    let intervalId: ReturnType<typeof setInterval>;
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
