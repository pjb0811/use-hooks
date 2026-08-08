import { useEffect, useRef } from 'react';

// Returns the value from the *previous* render. Updated in an effect
// (which runs after render/paint) rather than during render, so the
// current render still reads whatever was current one render ago.
const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
};

export default usePrevious;
