import { useSyncExternalStore } from 'react';

const subscribe = (onStoreChange: () => void) => {
  document.addEventListener('visibilitychange', onStoreChange);

  return () => {
    document.removeEventListener('visibilitychange', onStoreChange);
  };
};

const getSnapshot = () => document.visibilityState === 'visible';

// There is no document on the server, so the page renders as visible.
const getServerSnapshot = () => true;

// Returns whether the page is visible (`document.visibilityState` is
// `'visible'`). Pair it with a timer to pause work in a background tab, for
// example `useInterval(refresh, visible ? 5000 : null)`.
const useDocumentVisibility = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export default useDocumentVisibility;
