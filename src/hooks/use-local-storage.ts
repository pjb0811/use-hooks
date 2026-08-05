import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

// Module-level so every `useLocalStorage(key)` instance for the same key —
// even across unrelated components in the same tab — shares one cache and
// subscriber list. That's what makes same-tab sync possible: the native
// `storage` event only fires in *other* tabs, so same-tab updates have to
// be broadcast by us via `notify()`.
interface CacheEntry<T> {
  raw: string | null;
  value: T;
}

const cache = new Map<string, CacheEntry<unknown>>();
const listeners = new Map<string, Set<() => void>>();

function getListeners(key: string) {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  return set;
}

function notify(key: string) {
  getListeners(key).forEach(callback => callback());
}

// Returns the same cached value reference as long as the raw localStorage
// string hasn't changed, so `useSyncExternalStore` doesn't see a "new"
// snapshot (and re-render) on every call — only when the value actually
// changed.
function getSnapshot<T>(key: string, initialValue: T): T {
  const raw = typeof window === 'undefined' ? null : localStorage.getItem(key);
  const cached = cache.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.raw === raw) {
    return cached.value;
  }

  let value: T;
  try {
    value = raw === null ? initialValue : (JSON.parse(raw) as T);
  } catch {
    value = initialValue;
  }

  cache.set(key, { raw, value });
  return value;
}

function subscribe(key: string, callback: () => void) {
  const set = getListeners(key);
  set.add(callback);

  const onStorage = (event: StorageEvent) => {
    if (event.key === key) {
      callback();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }

  return () => {
    set.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

const useLocalStorage = <T>(key: string, initialValue: T) => {
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    initialValueRef.current = initialValue;
  });

  // Seed the key with the initial value if it isn't set yet — done in an
  // effect (not inside the state updater below) so it's a one-shot side
  // effect rather than something React could invoke twice under
  // StrictMode/concurrent rendering.
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (localStorage.getItem(key) === null) {
        const raw = JSON.stringify(initialValueRef.current);
        localStorage.setItem(key, raw);
        cache.set(key, { raw, value: initialValueRef.current });
        notify(key);
      }
    } catch (e) {
      console.error(`Error seeding localStorage key "${key}":`, e);
    }
  }, [key]);

  const subscribeForKey = useCallback(
    (callback: () => void) => subscribe(key, callback),
    [key],
  );

  const getSnapshotForKey = useCallback(
    () => getSnapshot(key, initialValueRef.current),
    [key],
  );

  const getServerSnapshot = useCallback(() => initialValueRef.current, []);

  const storedValue = useSyncExternalStore(
    subscribeForKey,
    getSnapshotForKey,
    getServerSnapshot,
  );

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const prev = getSnapshot(key, initialValueRef.current);
        const valueToStore = value instanceof Function ? value(prev) : value;
        const raw = JSON.stringify(valueToStore);

        localStorage.setItem(key, raw);
        cache.set(key, { raw, value: valueToStore });
        notify(key);
      } catch (e) {
        console.error(`Error setting localStorage key "${key}":`, e);
      }
    },
    [key],
  );

  return [storedValue, setValue] as const;
};

export default useLocalStorage;
