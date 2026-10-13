import { useSyncExternalStore } from 'react';

interface SetHashOptions {
  // Replace the current history entry instead of adding one.
  replace?: boolean;
}

// Subscribers notified after a write through `history`, which fires no
// `hashchange`.
const historyListeners = new Set<() => void>();

const subscribe = (onStoreChange: () => void) => {
  historyListeners.add(onStoreChange);
  window.addEventListener('hashchange', onStoreChange);

  return () => {
    historyListeners.delete(onStoreChange);
    window.removeEventListener('hashchange', onStoreChange);
  };
};

// `location.hash` without the `#`, decoded. A malformed escape is returned
// as is rather than throwing.
const getSnapshot = () => {
  const raw = window.location.hash.slice(1);

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

// There is no location on the server, so the page renders with no hash.
const getServerSnapshot = () => '';

// An empty `next` goes through `history` too, since assigning
// `location.hash = ''` leaves a bare `#` in the URL (#274).
const setHash = (next: string, { replace = false }: SetHashOptions = {}) => {
  if (!replace && next !== '') {
    window.location.hash = next;

    return;
  }

  const url = new URL(window.location.href);

  url.hash = next;

  if (replace) {
    window.history.replaceState(window.history.state, '', url);
  } else if (url.href !== window.location.href) {
    window.history.pushState(window.history.state, '', url);
  } else {
    return;
  }

  historyListeners.forEach(listener => listener());
};

// Returns the URL hash without the `#` and a setter for it, for state that a
// reload, a shared link or back/forward should restore. Every component
// using it reads the same value. `setHash` adds a history entry unless
// `replace` is set, and keeps one identity. A hash changed elsewhere through
// `history.pushState` or `replaceState` fires no `hashchange`, so the hook
// doesn't see it until the next `hashchange`.
const useHash = () => {
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return [hash, setHash] as const;
};

export default useHash;
