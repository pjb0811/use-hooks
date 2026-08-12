import { useEffect, useState } from 'react';

import useThrottledCallback from './use-throttled-callback';

interface Options {
  leading?: boolean;
  trailing?: boolean;
}

const useThrottledValue = <T>(
  value: T,
  delay = 100,
  options: Options = {},
): T => {
  const [throttledValue, setThrottledValue] = useState(value);

  const throttledSetValue = useThrottledCallback(
    setThrottledValue,
    delay,
    options,
  );

  useEffect(() => {
    throttledSetValue(value);
    // `throttledSetValue`'s identity is stable for the lifetime of the
    // component (see useThrottledCallback), so listing it here doesn't
    // cause any extra re-runs beyond `value` actually changing.
  }, [value, throttledSetValue]);

  return throttledValue;
};

export default useThrottledValue;
