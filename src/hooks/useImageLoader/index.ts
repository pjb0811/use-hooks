import { useEffect, useState } from 'react';

const useImageLoader = (src: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | Event>();

  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }

    const img = new Image();

    img.src = src;

    img.onload = () => setLoading(false);
    img.onerror = err => {
      setLoading(false);
      setError(err);
    };
  }, [src]);

  return {
    loading,
    error,
  };
};

export default useImageLoader;
