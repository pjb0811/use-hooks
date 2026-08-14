import { useCallback, useEffect, useState } from 'react';

interface Options {
  retryCount?: number;
  retryDelay?: number;
}

const useImage = (src: string, options: Options = {}) => {
  const { retryCount = 0, retryDelay = 1000 } = options;

  const [loading, setLoading] = useState(() => Boolean(src));
  const [error, setError] = useState<Error | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);
  const [prevTrigger, setPrevTrigger] = useState({
    src,
    attemptCount,
    retryCount,
    retryDelay,
    reloadToken,
  });

  // Adjusted directly in render (React's "adjust state during render"
  // pattern) instead of inside the effect below — mirrors that effect's
  // own dependency list, so `loading`/`error`/`loaded` reset in the same
  // render a reload is triggered rather than the render after.
  const triggerChanged =
    prevTrigger.src !== src ||
    prevTrigger.attemptCount !== attemptCount ||
    prevTrigger.retryCount !== retryCount ||
    prevTrigger.retryDelay !== retryDelay ||
    prevTrigger.reloadToken !== reloadToken;

  if (triggerChanged) {
    setPrevTrigger({ src, attemptCount, retryCount, retryDelay, reloadToken });

    if (src) {
      setLoading(true);
      setError(null);
    } else {
      setLoading(false);
      setLoaded(false);
    }
  }

  useEffect(() => {
    if (!src) {
      return;
    }

    let cancelled = false;
    let retryTimeoutId: ReturnType<typeof setTimeout> | undefined;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      if (cancelled) {
        return;
      }
      setLoading(false);
      setLoaded(true);
      setError(null);
    };

    img.onerror = event => {
      if (cancelled) {
        return;
      }
      setLoading(false);
      setLoaded(false);
      // `img.onerror`'s handler type is `OnErrorEventHandler`, so `event`
      // is typed `Event | string` even though the browser only ever
      // passes an `Event` here — that `Event` carries no useful failure
      // reason itself, so it's kept as `cause` rather than surfaced
      // directly as `error`.
      setError(new Error(`Failed to load image: ${src}`, { cause: event }));

      if (attemptCount < retryCount) {
        retryTimeoutId = setTimeout(() => {
          if (!cancelled) {
            setAttemptCount(prev => prev + 1);
          }
        }, retryDelay);
      }
    };

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
      }
    };
  }, [src, attemptCount, retryCount, retryDelay, reloadToken]);

  const retry = useCallback(() => {
    setAttemptCount(0);
    setReloadToken(token => token + 1);
  }, []);

  return {
    loading,
    error,
    loaded,
    retry,
    attemptCount,
  };
};

export default useImage;
