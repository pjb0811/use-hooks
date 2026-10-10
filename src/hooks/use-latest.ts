import { useEffect, useRef } from 'react';

// Returns a ref whose `current` is `value` from the latest committed render.
// The ref has one identity for the life of the component, so it is safe in
// dependency arrays. Read `current` from event handlers, timers and effects
// that are set up once; don't read it during render. It is refreshed in an
// effect, so an effect that runs earlier in the same commit can still see
// the previous value.
const useLatest = <T>(value: T) => {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  });

  return ref;
};

export default useLatest;
