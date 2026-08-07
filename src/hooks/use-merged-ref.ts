import { type RefObject, useCallback } from 'react';

type MergeableRef<T> =
  | ((node: T | null) => void | (() => void))
  | RefObject<T | null>
  | null
  | undefined;

// Merges any number of refs (forwarded function refs, RefObjects, or
// either left null/undefined) into one callback ref that updates all of
// them. Collects React 19's optional per-ref cleanup return values and
// runs them together when the node detaches.
const useMergedRef = <T>(...refs: MergeableRef<T>[]) => {
  return useCallback((node: T | null) => {
    const cleanups: (() => void)[] = [];

    refs.forEach(ref => {
      if (!ref) {
        return;
      }

      if (typeof ref === 'function') {
        const cleanup = ref(node);

        if (typeof cleanup === 'function') {
          cleanups.push(cleanup);
        }
        return;
      }

      ref.current = node;
    });

    if (cleanups.length === 0) {
      return;
    }

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
    // The number of refs passed at a given call site is stable across
    // renders even though this array literal isn't — same pattern every
    // ref-merging hook of this shape relies on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
};

export default useMergedRef;
