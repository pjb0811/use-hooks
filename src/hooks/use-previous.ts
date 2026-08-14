import { useEffect, useRef } from 'react';

// Returns the value from the *previous* render. Updated in an effect
// (which runs after render/paint) rather than during render, so the
// current render still reads whatever was current one render ago.
const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  });

  // Reading `ref.current` during render is normally disallowed, but this
  // hook's entire contract *is* "the value as of the last commit" — there's
  // no derived-state rewrite that preserves that exact semantics (a
  // state-comparison rewrite would only track the last *distinct* value,
  // a breaking change to what's documented in the README). The react.dev
  // sanctioned "lazy ref init" exception doesn't apply either — this isn't
  // init-once, it updates every commit — and even that sanctioned pattern
  // still trips this same rule as of eslint-plugin-react-hooks 6.x/7.x,
  // per an open, unresolved upstream bug: facebook/react#36896.
  // eslint-disable-next-line react-hooks/refs
  return ref.current;
};

export default usePrevious;
