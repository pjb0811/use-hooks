import { useEffect, useRef, useState } from 'react';

interface Options {
  delay?: number;
  autoInvoke?: boolean;
  leading?: boolean;
  // Run a call that is still waiting when the component unmounts, instead of
  // dropping it. For work that must not be lost when its UI goes away, such
  // as saving the last edit of a field that is being closed.
  flushOnUnmount?: boolean;
}

// The returned function schedules `callback`. Its methods act on a call that
// is waiting for the delay to pass: `flush` runs it now, `cancel` drops it.
// Both do nothing when no call is waiting.
export interface DebouncedCallback {
  (): void;
  flush: () => void;
  cancel: () => void;
}

// Auto-invokes `callback` (debounced by `delay`ms) whenever `deps` change,
// and also returns a stable debounced version of `callback` for manual use.
// `callback` intentionally takes no arguments — the deps-triggered
// auto-invoke has no natural argument to supply, so an arg-taking callback
// here was a latent type hole (it was always invoked with zero args
// regardless of what the callback's own signature claimed).
const useDebouncedCallback = (
  callback: () => unknown,
  {
    delay = 100,
    autoInvoke = true,
    leading = true,
    flushOnUnmount = false,
  }: Options,
  deps: React.DependencyList = [],
): DebouncedCallback => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  // Read the latest `delay` when the timeout actually fires, instead of
  // baking in whatever `delay` was on the render that created the stable
  // debounced function (which otherwise never updates again).
  const delayRef = useRef(delay);
  const flushOnUnmountRef = useRef(flushOnUnmount);
  const prevDeps = useRef<React.DependencyList | undefined>(undefined);

  useEffect(() => {
    callbackRef.current = callback;
    delayRef.current = delay;
    flushOnUnmountRef.current = flushOnUnmount;
  });

  // Built once via useState's lazy initializer (runs only on mount) rather
  // than the ref-guarded-by-if pattern this used to use — same "create
  // once, keep a stable identity" effect, but without ever reading/writing
  // a ref during render, which react-hooks/refs now disallows even for the
  // otherwise-idempotent lazy-ref-init form (see facebook/react#36896).
  //
  // `timeoutRef` holding a timer is what "a call is waiting" means, so it is
  // cleared before the callback runs, whichever way it runs.
  const [cancel] = useState(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  });

  const [flush] = useState(() => () => {
    if (!timeoutRef.current) {
      return;
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    callbackRef.current();
  });

  const [schedule] = useState(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      callbackRef.current();
    }, delayRef.current);
  });

  // Each piece above is its own lazy initializer that only returns a
  // function: building them inside one initializer that also calls
  // `Object.assign` reads to the refs rule as touching refs during render.
  const [stableDebouncedCallback] = useState<DebouncedCallback>(() =>
    Object.assign(() => schedule(), { flush, cancel }),
  );

  useEffect(() => {
    const depsChanged =
      prevDeps.current === undefined ||
      prevDeps.current.length !== deps.length ||
      prevDeps.current.some((dep, i) => dep !== deps[i]);

    if (depsChanged) {
      stableDebouncedCallback.cancel();
    }

    if (autoInvoke && depsChanged) {
      const isFirstRender = prevDeps.current === undefined;

      // `leading` makes the "first invocation fires immediately, without
      // waiting `delay`ms" behavior explicit and opt-out-able, instead of
      // an unconditional special case baked into the first render.
      if (isFirstRender && leading) {
        callbackRef.current();
      } else {
        stableDebouncedCallback();
      }
    }

    prevDeps.current = deps;
  });

  useEffect(() => {
    return () => {
      if (flushOnUnmountRef.current) {
        stableDebouncedCallback.flush();
      } else {
        stableDebouncedCallback.cancel();
      }
    };
  }, [stableDebouncedCallback]);

  return stableDebouncedCallback;
};

export default useDebouncedCallback;
