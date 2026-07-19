import { useCallback, useEffect, useState } from 'react';

interface Options {
  retryCount?: number;
  retryDelay?: number;
}

const useImage = (src: string, options: Options = {}) => {
  const { retryCount = 0, retryDelay = 1000 } = options;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | Event | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      setLoaded(false);
      return;
    }

    let cancelled = false;
    let retryTimeoutId: ReturnType<typeof setTimeout> | undefined;

    setLoading(true);
    setError(null);

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

    img.onerror = err => {
      if (cancelled) {
        return;
      }
      setLoading(false);
      setLoaded(false);
      setError(err);

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
  };
};

export default useImage;
