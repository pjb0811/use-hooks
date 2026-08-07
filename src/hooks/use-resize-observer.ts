import { useCallback, useRef, useState } from 'react';

interface Size {
  width: number;
  height: number;
}

interface Options {
  box?: ResizeObserverBoxOptions;
}

// The unprocessed version of useResponsiveSize/useElementScroll/
// useElementPosition — those each return values shaped for their own
// purpose (breakpoints, scroll position, a viewport-relative DOMRect).
// This one just reports an element's own width/height.
const useResizeObserver = <T extends Element = Element>(
  options?: Options,
): [(node: T | null) => void, Size | null] => {
  const [size, setSize] = useState<Size | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  // Same convention as useIntersectionObserver: `options` is typically a
  // fresh object literal at the call site, so it isn't a dependency here
  // — that would tear down and recreate the observer on every render. The
  // ref callback only re-runs when the observed node itself changes,
  // capturing whatever `options` was current at that time.
  const ref = useCallback((node: T | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node || typeof ResizeObserver === 'undefined') {
      return;
    }

    const box = options?.box ?? 'content-box';

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }

      const [{ inlineSize, blockSize }] =
        box === 'border-box' ? entry.borderBoxSize : entry.contentBoxSize;

      setSize({ width: inlineSize, height: blockSize });
    });

    observer.observe(node, { box });
    observerRef.current = observer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, size];
};

export default useResizeObserver;
