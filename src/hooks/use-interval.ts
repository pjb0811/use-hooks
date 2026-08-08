import { useEffect, useRef } from 'react';

// Dan Abramov's useInterval pattern: the callback lives in a ref so a
// fresh function every render doesn't reset the interval — only `delay`
// actually changing does that. `delay === null` pauses it (same rule as
// useTimeout/useRecursiveTimeout); toggling back to a number resumes on
// a fresh interval rather than trying to pick up mid-tick.
const useInterval = (callback: () => void, delay: number | null) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const id = setInterval(() => {
      callbackRef.current();
    }, delay);

    return () => clearInterval(id);
  }, [delay]);
};

export default useInterval;
