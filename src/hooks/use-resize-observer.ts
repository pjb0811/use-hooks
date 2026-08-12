import { useCallback, useEffect, useRef, useState } from 'react';

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
  const box = options?.box ?? 'content-box';

  const [size, setSize] = useState<Size | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const nodeRef = useRef<T | null>(null);

  // `options` is typically a fresh object literal at the call site — track
  // the current box in a ref (read at connect time) and reconnect only when
  // the value actually changes, so `box` can be flipped at runtime without
  // tearing the observer down on every render. The previous version pinned
  // whatever `box` was current when the node first attached and never
  // reacted to changes — the same bug #118 fixed in useIntersectionObserver.
  const boxRef = useRef(box);

  useEffect(() => {
    boxRef.current = box;
  });

  const connect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const node = nodeRef.current;

    if (!node || typeof ResizeObserver === 'undefined') {
      return;
    }

    const currentBox = boxRef.current;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return;
      }

      const boxSize =
        currentBox === 'border-box'
          ? entry.borderBoxSize
          : entry.contentBoxSize;
      const measurement = boxSize?.[0];

      if (measurement) {
        // inlineSize/blockSize are writing-mode relative; for the default
        // horizontal-tb writing mode they map to width/height as expected.
        setSize({
          width: measurement.inlineSize,
          height: measurement.blockSize,
        });
      } else {
        // contentBoxSize/borderBoxSize come back as empty arrays for a
        // `display: none` target, so destructuring the first element would
        // throw. contentRect still reports (0×0 there) and is already in
        // physical width/height, so it's also unaffected by writing-mode.
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(node, { box: currentBox });
    observerRef.current = observer;
  }, []);

  const ref = useCallback((node: T | null) => {
    nodeRef.current = node;
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [box]);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return [ref, size];
};

export default useResizeObserver;
