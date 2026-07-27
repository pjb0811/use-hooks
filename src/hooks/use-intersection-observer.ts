import { useCallback, useRef, useState } from 'react';

const useIntersectionObserver = <T extends Element = Element>(
  options?: IntersectionObserverInit,
): [(node: T | null) => void, IntersectionObserverEntry | null] => {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // `options` is typically re-created as a fresh object on every render by
  // callers (e.g. spreading caller-provided overrides into defaults), so it
  // intentionally isn't a dependency here — that would tear down and
  // recreate the observer on every render. The ref callback only re-runs
  // when the observed node itself changes, capturing whatever `options`
  // was current at that time (matching the common useIntersectionObserver
  // convention, e.g. @uidotdev/usehooks).
  const ref = useCallback((node: T | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!node || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(([observedEntry]) => {
      setEntry(observedEntry);
    }, options);

    observer.observe(node);
    observerRef.current = observer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, entry];
};

export default useIntersectionObserver;
