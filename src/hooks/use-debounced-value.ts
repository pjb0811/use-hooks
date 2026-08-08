import { useEffect, useRef, useState } from 'react';

// The value-shaped counterpart to useDebounce (which is callback-shaped),
// symmetric with useThrottle's `(value, delay) => value` signature. The
// common "just give me the debounced value" case otherwise needs two
// pieces of state and an effect built on useDebounce by hand.
const useDebouncedValue = <T>(value: T, delay = 100): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebouncedValue;
