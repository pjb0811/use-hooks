import { useCallback, useEffect, useSyncExternalStore } from 'react';

import useLatest from './use-latest';

interface CacheEntry<T> {
  raw: string | null;
  value: T;
}

// Builds a `[value, setValue]` hook for one Web Storage area. `getStorage` is
// called on use, not at creation, so the module can load where the storage
// global does not exist (SSR).
//
// The cache and the subscriber lists live inside the factory, so each storage
// area has its own. A `localStorage` key and a `sessionStorage` key with the
// same name never share an entry. Within one area, every hook instance for the
// same key — even across unrelated components in the same tab — shares one
// cache and one subscriber list. That is what makes same-tab sync possible:
// the native `storage` event only reaches other documents, so same-tab updates
// are broadcast by `notify()`.
const createStorageHook = (getStorage: () => Storage, name: string) => {
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

  // Returns the same cached value reference as long as the raw storage string
  // is unchanged, so `useSyncExternalStore` only re-renders when the value
  // actually changed.
  function getSnapshot<T>(key: string, initialValue: T): T {
    const raw =
      typeof window === 'undefined' ? null : getStorage().getItem(key);
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
      if (event.key === key && event.storageArea === getStorage()) {
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

  return <T>(key: string, initialValue: T) => {
    const initialValueRef = useLatest(initialValue);

    // Seed the key with the initial value if it isn't set yet. This runs in an
    // effect, not in the setter below, so it is a one-shot side effect that
    // React can't invoke twice under StrictMode or concurrent rendering.
    useEffect(() => {
      if (typeof window === 'undefined') {
        return;
      }

      try {
        if (getStorage().getItem(key) === null) {
          const raw = JSON.stringify(initialValueRef.current);

          getStorage().setItem(key, raw);
          cache.set(key, { raw, value: initialValueRef.current });
          notify(key);
        }
      } catch (e) {
        console.error(`Error seeding ${name} key "${key}":`, e);
      }
    }, [key, initialValueRef]);

    const subscribeForKey = useCallback(
      (callback: () => void) => subscribe(key, callback),
      [key],
    );

    const getSnapshotForKey = useCallback(
      () => getSnapshot(key, initialValueRef.current),
      [key, initialValueRef],
    );

    const getServerSnapshot = useCallback(
      () => initialValueRef.current,
      [initialValueRef],
    );

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

          getStorage().setItem(key, raw);
          cache.set(key, { raw, value: valueToStore });
          notify(key);
        } catch (e) {
          console.error(`Error setting ${name} key "${key}":`, e);
        }
      },
      [key, initialValueRef],
    );

    return [storedValue, setValue] as const;
  };
};

export default createStorageHook;
