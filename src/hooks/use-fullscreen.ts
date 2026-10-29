import { useCallback, useRef, useState, useSyncExternalStore } from 'react';

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)));

const subscribeNothing = () => () => {};

// Shows the element behind `ref` full screen with the Fullscreen API.
// `isFullscreen` is true only while that element itself is the document's
// full-screen element, and follows `fullscreenchange` on its owner document,
// so leaving with Esc or another element going full screen updates it.
// `isSupported` is `document.fullscreenEnabled`: false on the server, on
// browsers without the unprefixed API (iPhone Safari) and in an iframe
// without `allow="fullscreen"`.
//
// `enter` and `exit` resolve once the request settles and never throw; a
// rejected request (for example `enter` outside a user gesture) is stored in
// `error` until the next request. `exit` and `toggle` act only on this
// element, so they leave another element's full screen alone. `ref`,
// `enter`, `exit` and `toggle` keep their identity across renders.
const useFullscreen = <T extends HTMLElement = HTMLElement>() => {
  const [element, setElement] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const elementRef = useRef<T | null>(null);

  const ownerDocument =
    element?.ownerDocument ??
    (typeof document === 'undefined' ? null : document);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!ownerDocument) {
        return () => {};
      }

      ownerDocument.addEventListener('fullscreenchange', onStoreChange);

      return () =>
        ownerDocument.removeEventListener('fullscreenchange', onStoreChange);
    },
    [ownerDocument],
  );

  const isFullscreen = useSyncExternalStore(
    subscribe,
    () => element !== null && ownerDocument?.fullscreenElement === element,
    () => false,
  );
  const isSupported = useSyncExternalStore(
    subscribeNothing,
    () => ownerDocument?.fullscreenEnabled === true,
    () => false,
  );

  const ref = useCallback((node: T | null) => {
    elementRef.current = node;
    setElement(node);
  }, []);

  const enter = useCallback(async () => {
    const target = elementRef.current;

    if (!target) {
      return;
    }

    setError(null);

    try {
      await target.requestFullscreen();
    } catch (e) {
      setError(toError(e));
    }
  }, []);

  const exit = useCallback(async () => {
    const target = elementRef.current;

    if (!target || target.ownerDocument.fullscreenElement !== target) {
      return;
    }

    setError(null);

    try {
      await target.ownerDocument.exitFullscreen();
    } catch (e) {
      setError(toError(e));
    }
  }, []);

  const toggle = useCallback(() => {
    const target = elementRef.current;

    if (target && target.ownerDocument.fullscreenElement === target) {
      return exit();
    }

    return enter();
  }, [enter, exit]);

  return { ref, isFullscreen, isSupported, enter, exit, toggle, error };
};

export default useFullscreen;
