import { type RefObject, useEffect, useRef } from 'react';

type Target<T extends Node> = RefObject<T | null> | T | null | undefined;

interface Options extends MutationObserverInit {
  enabled?: boolean;
}

const resolveTarget = <T extends Node>(target: Target<T>): T | null => {
  if (!target) {
    return null;
  }
  return 'current' in target ? target.current : target;
};

// Takes the target directly (a RefObject, or a plain Node like
// document.head that isn't behind any React ref at all) rather than
// producing its own — this and useResizeObserver together replace the
// ResizeObserver+MutationObserver pair live-editor's iframe hand-rolls
// for auto-sizing its preview content.
const useMutationObserver = <T extends Node>(
  target: Target<T>,
  callback: MutationCallback,
  options: Options = {},
) => {
  const { enabled = true, ...mutationOptions } = options;

  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  // `mutationOptions` is typically a fresh object literal at the call
  // site — serialize it into a stable key instead of depending on the
  // object itself, which would tear down and recreate the observer on
  // every render.
  const optionsKey = JSON.stringify(mutationOptions);

  useEffect(() => {
    const node = resolveTarget(target);

    if (!enabled || !node || typeof MutationObserver === 'undefined') {
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      callbackRef.current(mutations, obs);
    });

    observer.observe(node, mutationOptions);

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, enabled, optionsKey]);
};

export default useMutationObserver;
