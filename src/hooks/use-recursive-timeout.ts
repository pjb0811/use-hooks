import { useEffect, useRef } from 'react';

interface Options {
  // Whether a rejected callback should stop the loop instead of scheduling
  // the next tick. Defaults to false — one failed tick shouldn't kill a
  // polling loop, but the rejection is still logged either way.
  stopOnError?: boolean;
}

const useRecursiveTimeout = <T>(
  callback: () => Promise<T> | void,
  delay: number | null,
  options: Options = {},
) => {
  const savedCallback = useRef(callback);
  const savedStopOnError = useRef(options.stopOnError ?? false);

  useEffect(() => {
    savedCallback.current = callback;
    savedStopOnError.current = options.stopOnError ?? false;
  });

  useEffect(() => {
    if (delay === null) {
      return;
    }

    let id: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const scheduleNext = () => {
      if (!cancelled) {
        id = setTimeout(tick, delay);
      }
    };

    function tick() {
      const ret = savedCallback.current();

      if (ret instanceof Promise) {
        ret.then(scheduleNext, (error: unknown) => {
          console.error('useRecursiveTimeout callback rejected:', error);
          if (!savedStopOnError.current) {
            scheduleNext();
          }
        });
      } else {
        scheduleNext();
      }
    }

    id = setTimeout(tick, delay);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [delay]);
};

export default useRecursiveTimeout;
