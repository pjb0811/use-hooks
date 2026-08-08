import { useCallback, useEffect, useRef, useState } from 'react';

interface Options extends IntersectionObserverInit {
  // Disconnects for good the first time the target becomes intersecting
  // — the common "seen once, that's enough" case (lazy loading, entrance
  // animations, infinite-scroll triggers) that otherwise needs the
  // consumer to track their own "already fired" flag.
  freezeOnceVisible?: boolean;
}

interface Result {
  entry: IntersectionObserverEntry | null;
  isIntersecting: boolean;
}

const useIntersectionObserver = <T extends Element = Element>(
  options?: Options,
): [(node: T | null) => void, Result] => {
  const { freezeOnceVisible = false, ...observerInit } = options ?? {};

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const nodeRef = useRef<T | null>(null);
  const frozenRef = useRef(false);

  // `options` is typically a fresh object literal at the call site —
  // serialize the IntersectionObserverInit part into a stable key so
  // reconnecting only happens when it actually changes, not on every
  // render (the previous version didn't reconnect on options changes at
  // all, so threshold/rootMargin could never be updated at runtime).
  const observerInitKey = JSON.stringify(observerInit);
  const observerInitRef = useRef(observerInit);
  const freezeRef = useRef(freezeOnceVisible);

  useEffect(() => {
    observerInitRef.current = observerInit;
    freezeRef.current = freezeOnceVisible;
  });

  const connect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const node = nodeRef.current;

    if (
      !node ||
      typeof IntersectionObserver === 'undefined' ||
      frozenRef.current
    ) {
      return;
    }

    const observer = new IntersectionObserver(([observedEntry]) => {
      if (!observedEntry) {
        return;
      }

      setEntry(observedEntry);

      if (observedEntry.isIntersecting && freezeRef.current) {
        frozenRef.current = true;
        observer.disconnect();
      }
    }, observerInitRef.current);

    observer.observe(node);
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
  }, [observerInitKey]);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return [ref, { entry, isIntersecting: entry?.isIntersecting ?? false }];
};

export default useIntersectionObserver;
