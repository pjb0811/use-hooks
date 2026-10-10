import { useCallback, useEffect, useRef } from 'react';

import useLatest from './use-latest';

// `delay === null` means inactive (no timer scheduled) — `0` is a valid,
// distinct delay, same rule useRecursiveTimeout uses. A bare `if (!delay)`
// guard (as opposed to `if (delay === null)`) is the classic bug this
// hook exists to avoid: it silently no-ops for a delay of 0 too.
const useTimeout = (callback: () => void, delay: number | null) => {
  const callbackRef = useLatest(callback);
  const delayRef = useLatest(delay);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Restarts the timer from now, using whatever `delay` is current —
  // e.g. a toast's auto-dismiss timer that should start over each time
  // the user hovers away from it.
  const reset = useCallback(() => {
    clear();

    if (delayRef.current === null) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      callbackRef.current();
    }, delayRef.current);
  }, [clear, callbackRef, delayRef]);

  useEffect(() => {
    reset();
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);

  return { reset, clear };
};

export default useTimeout;
