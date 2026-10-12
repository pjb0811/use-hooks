import { useSyncExternalStore } from 'react';

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener('online', onStoreChange);
  window.addEventListener('offline', onStoreChange);

  return () => {
    window.removeEventListener('online', onStoreChange);
    window.removeEventListener('offline', onStoreChange);
  };
};

const getSnapshot = () => navigator.onLine;

// There is no navigator on the server, so the page renders as online.
const getServerSnapshot = () => true;

// Returns whether the browser has a network connection (`navigator.onLine`).
// `true` doesn't mean a given server is reachable, only that the browser is
// connected to some network.
const useOnlineStatus = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export default useOnlineStatus;
