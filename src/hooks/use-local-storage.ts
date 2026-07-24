import { useCallback, useEffect, useRef, useState } from 'react';

const useLocalStorage = <T>(key: string, initialValue: T) => {
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    initialValueRef.current = initialValue;
  });

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item) as T);
      } else {
        window.localStorage.setItem(
          key,
          JSON.stringify(initialValueRef.current),
        );
      }
    } catch (e) {
      console.error(`Error reading localStorage key "${key}":`, e);
    }
  }, [key]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) {
        return;
      }

      try {
        setStoredValue(
          event.newValue
            ? (JSON.parse(event.newValue) as T)
            : initialValueRef.current,
        );
      } catch (e) {
        console.error(
          `Error parsing localStorage key "${key}" from storage event:`,
          e,
        );
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue(prev => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch (e) {
        console.error(`Error setting localStorage key "${key}":`, e);
      }
    },
    [key],
  );

  return [storedValue, setValue] as const;
};

export default useLocalStorage;
