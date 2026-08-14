import { useEffect, useRef, useState } from 'react';

interface Options {
  leading?: boolean;
  trailing?: boolean;
}

// Invokes `callback` at most once per `delay`ms, regardless of how often
// the returned function is called — the callback-shaped counterpart to
// useThrottle (which throttles a value). `leading` fires on the first call
// of a burst immediately; `trailing` schedules one more call (with
// whatever args arrived last) at the end of the window if calls kept
// coming. Both default to true, matching useThrottle's fixed behavior.
const useThrottledCallback = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay = 100,
  { leading = true, trailing = true }: Options = {},
) => {
  const callbackRef = useRef(callback);
  const delayRef = useRef(delay);
  const leadingRef = useRef(leading);
  const trailingRef = useRef(trailing);

  useEffect(() => {
    callbackRef.current = callback;
    delayRef.current = delay;
    leadingRef.current = leading;
    trailingRef.current = trailing;
  });

  const lastExecutedRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Args | null>(null);

  // Built once via useState's lazy initializer (runs only on mount) rather
  // than the ref-guarded-by-if pattern this used to use — same "create
  // once, keep a stable identity" effect, but without ever reading/writing
  // a ref during render, which react-hooks/refs now disallows even for the
  // otherwise-idempotent lazy-ref-init form (see facebook/react#36896).
  const [stableThrottledCallback] = useState(() => {
    const invoke = () => {
      lastExecutedRef.current = Date.now();
      timeoutRef.current = null;

      if (lastArgsRef.current) {
        callbackRef.current(...lastArgsRef.current);
      }
    };

    return (...args: Args) => {
      lastArgsRef.current = args;

      const now = Date.now();
      const elapsed =
        lastExecutedRef.current === null
          ? Infinity
          : now - lastExecutedRef.current;

      if (elapsed >= delayRef.current) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (leadingRef.current) {
          invoke();
        } else {
          lastExecutedRef.current = now;

          if (trailingRef.current) {
            timeoutRef.current = setTimeout(invoke, delayRef.current);
          }
        }
        return;
      }

      if (trailingRef.current && !timeoutRef.current) {
        timeoutRef.current = setTimeout(invoke, delayRef.current - elapsed);
      }
    };
  });

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return stableThrottledCallback;
};

export default useThrottledCallback;
