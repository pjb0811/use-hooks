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

  const loadImage = useCallback(() => {
    if (!src) {
      setLoading(false);
      setLoaded(false);
      return;
    }

    setLoading(true);
    setError(null);

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setLoading(false);
      setLoaded(true);
      setError(null);
      setAttemptCount(0);
    };

    img.onerror = err => {
      setLoading(false);
      setLoaded(false);
      setError(err);

      if (attemptCount < retryCount) {
        setTimeout(() => {
          setAttemptCount(prev => prev + 1);
        }, retryDelay);
      }
    };
  }, [src, attemptCount, retryCount, retryDelay]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  const retry = useCallback(() => {
    setAttemptCount(0);
    loadImage();
  }, [loadImage]);

  return {
    loading,
    error,
    loaded,
    retry,
  };
};

export default useImage;
