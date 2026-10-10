import { useCallback, useEffect, useState } from 'react';

interface Options {
  // How long `copied` stays `true` after a successful copy, in ms. `null`
  // keeps it `true` until the next copy.
  resetDelay?: number | null;
}

// Copies text with `navigator.clipboard.writeText`. `copy` resolves to
// whether it worked, so a caller needs no `try`/`catch`. `copied` is `true`
// for `resetDelay` ms after a successful copy, and each copy restarts that
// time. `error` is the last failure (no Clipboard API, permission denied, an
// insecure context) until the next successful copy.
const useCopyToClipboard = ({ resetDelay = 1500 }: Options = {}) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // Counts successful copies, so a copy made while `copied` is already `true`
  // still restarts the timer below.
  const [copyCount, setCopyCount] = useState(0);

  useEffect(() => {
    if (!copied || resetDelay === null) {
      return;
    }

    const id = setTimeout(() => setCopied(false), resetDelay);

    return () => clearTimeout(id);
  }, [copied, copyCount, resetDelay]);

  const copy = useCallback(async (text: string) => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        throw new Error('The Clipboard API is not available.');
      }

      await navigator.clipboard.writeText(text);
    } catch (e) {
      setCopied(false);
      setError(e instanceof Error ? e : new Error(String(e)));

      return false;
    }

    setCopied(true);
    setError(null);
    setCopyCount(count => count + 1);

    return true;
  }, []);

  return { copy, copied, error };
};

export default useCopyToClipboard;
