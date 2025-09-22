import { useEffect, useRef } from 'react';

const useRecursiveTimeout = <T>(
  callback: () => Promise<T> | (() => void),
  delay: number | null,
) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    let id: NodeJS.Timeout;

    function tick() {
      const ret = savedCallback.current();

      if (ret instanceof Promise) {
        ret.then(() => {
          if (delay) {
            id = setTimeout(tick, delay);
          }
        });
      } else {
        if (delay) {
          id = setTimeout(tick, delay);
        }
      }
    }

    if (delay) {
      id = setTimeout(tick, delay);
      return () => id && clearTimeout(id);
    }
  }, [delay]);
};

export default useRecursiveTimeout;
