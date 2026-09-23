import { type RefObject, useCallback, useSyncExternalStore } from 'react';

type MediaQueryTarget = RefObject<Element | null> | Element | null;

interface Options {
  // Returned while `matchMedia` is unreachable — during SSR and on the
  // hydration render, where guessing wrong only costs one corrected
  // render once the real value is readable.
  defaultValue?: boolean;
  // Pass a ref to an element rendered inside the window the query should
  // be evaluated against (e.g. a node portaled into an iframe preview,
  // whose viewport is not the host one). Defaults to the host `window`.
  target?: MediaQueryTarget;
}

const resolveWindow = (target: MediaQueryTarget | undefined): Window | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const element = target && 'current' in target ? target.current : target;

  return element?.ownerDocument.defaultView ?? window;
};

const getMediaQueryList = (
  query: string,
  target: MediaQueryTarget | undefined,
) => {
  const view = resolveWindow(target);

  return view?.matchMedia ? view.matchMedia(query) : null;
};

const useMediaQuery = (query: string, options: Options = {}) => {
  const { defaultValue = false, target } = options;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = getMediaQueryList(query, target);

      if (!mql) {
        return () => {};
      }

      mql.addEventListener('change', onStoreChange);

      return () => {
        mql.removeEventListener('change', onStoreChange);
      };
    },
    [query, target],
  );

  // A fresh MediaQueryList per read is fine (and cheaper than caching one
  // per query): the snapshot handed to React is the boolean `matches`, so
  // there is no new object identity to churn re-renders.
  const getSnapshot = useCallback(
    () => getMediaQueryList(query, target)?.matches ?? defaultValue,
    [query, target, defaultValue],
  );

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

export default useMediaQuery;
