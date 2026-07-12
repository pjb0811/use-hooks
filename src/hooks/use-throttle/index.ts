import { useEffect, useRef, useState } from 'react';

const useThrottle = <T>(value: T, delay = 100): T => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecutedRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValueRef = useRef(value);

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastExecutedRef.current;

    if (elapsed >= delay) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      lastExecutedRef.current = now;
      setThrottledValue(latestValueRef.current);
      return;
    }

    const remaining = delay - elapsed;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      lastExecutedRef.current = Date.now();
      setThrottledValue(latestValueRef.current);
    }, remaining);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [value, delay]);

  return throttledValue;
};

export default useThrottle;
