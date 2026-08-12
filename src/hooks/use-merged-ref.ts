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
    // Per-ref cleanups, aligned to `refs` by index: a function ref that
    // returns its own cleanup keeps it here, everything else is undefined.
    const cleanups = refs.map(ref => {
      if (!ref) {
        return undefined;
      }

      if (typeof ref === 'function') {
        const cleanup = ref(node);
        return typeof cleanup === 'function' ? cleanup : undefined;
      }

      ref.current = node;
      return undefined;
    });

    // Always return a cleanup and detach *every* ref here. When any ref
    // returns a cleanup, React 19 runs this instead of re-invoking the
    // callback with null on detach — so if we only ran the collected
    // cleanups, the object refs and cleanup-less function refs merged
    // alongside would never be released and would pin a stale node.
    return () => {
      refs.forEach((ref, i) => {
        if (!ref) {
          return;
        }

        if (typeof ref === 'function') {
          const cleanup = cleanups[i];
          if (cleanup) {
            cleanup();
          } else {
            ref(null);
          }
          return;
        }

        ref.current = null;
      });
    };
    // The number of refs passed at a given call site is stable across
    // renders even though this array literal isn't — same pattern every
    // ref-merging hook of this shape relies on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
};

export default useMergedRef;
