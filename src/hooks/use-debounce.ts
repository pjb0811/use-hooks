import { useEffect, useRef } from 'react';

interface Options {
  delay?: number;
  autoInvoke?: boolean;
  leading?: boolean;
}

// Auto-invokes `callback` (debounced by `delay`ms) whenever `deps` change,
// and also returns a stable debounced version of `callback` for manual use.
// `callback` intentionally takes no arguments — the deps-triggered
// auto-invoke has no natural argument to supply, so an arg-taking callback
// here was a latent type hole (it was always invoked with zero args
// regardless of what the callback's own signature claimed).
const useDebounce = (
  callback: () => unknown,
  { delay = 100, autoInvoke = true, leading = true }: Options,
  deps: React.DependencyList = [],
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  // Read the latest `delay` when the timeout actually fires, instead of
  // baking in whatever `delay` was on the render that created the stable
  // debounced function (which otherwise never updates again).
  const delayRef = useRef(delay);
  const prevDeps = useRef<React.DependencyList | undefined>(undefined);

  useEffect(() => {
    callbackRef.current = callback;
    delayRef.current = delay;
  });

  const stableDebouncedCallback = useRef<(() => void) | null>(null);

  if (!stableDebouncedCallback.current) {
    stableDebouncedCallback.current = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current();
      }, delayRef.current);
    };
  }

  useEffect(() => {
    const depsChanged =
      prevDeps.current === undefined ||
      prevDeps.current.length !== deps.length ||
      prevDeps.current.some((dep, i) => dep !== deps[i]);

    if (depsChanged && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (autoInvoke && depsChanged) {
      const isFirstRender = prevDeps.current === undefined;

      // `leading` makes the "first invocation fires immediately, without
      // waiting `delay`ms" behavior explicit and opt-out-able, instead of
      // an unconditional special case baked into the first render.
      if (isFirstRender && leading) {
        callbackRef.current();
      } else {
        stableDebouncedCallback.current?.();
      }
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
