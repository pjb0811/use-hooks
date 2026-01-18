import { useEffect, useRef } from 'react';

interface Options {
  delay?: number;
  autoInvoke?: boolean;
}

const useDebounce = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  { delay = 100, autoInvoke = true }: Options,
  deps: React.DependencyList = [],
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);
  const prevDeps = useRef<React.DependencyList | undefined>(undefined);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    depsRef.current = deps;
  });

  const stableDebouncedCallback = useRef<T | null>(null);

  if (!stableDebouncedCallback.current) {
    stableDebouncedCallback.current = ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T;
  }

  useEffect(() => {
    const depsChanged =
      prevDeps.current === undefined ||
      prevDeps.current.length !== deps.length ||
      prevDeps.current.some((dep, i) => dep !== deps[i]);

    if (depsChanged && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (autoInvoke && depsChanged && stableDebouncedCallback.current) {
      stableDebouncedCallback.current();
    }

    prevDeps.current = deps;
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return stableDebouncedCallback.current;
};

export default useDebounce;
