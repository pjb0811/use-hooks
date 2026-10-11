import { useEffect, useState } from 'react';

import useLatest from './use-latest';

interface Options {
  // The window whose `requestAnimationFrame` is used, for elements that live
  // in an iframe. Defaults to the global `window`.
  window?: Window;
}

// Runs `callback` on the next animation frame. `schedule(...args)` requests a
// frame if none is pending; more calls before it fires replace the arguments
// instead of adding frames, so the callback runs once per frame with the
// latest arguments. `cancel()` drops the pending frame, and the hook cancels
// it on unmount. `schedule` and `cancel` keep their identity across renders,
// and a callback may call `schedule` again from inside itself.
const useAnimationFrameCallback = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  options: Options = {},
) => {
  const callbackRef = useLatest(callback);
  const windowRef = useLatest(options.window);

  // Built once through the lazy initializer, as the debounce and throttle
  // hooks do, so no ref is read or written during render.
  const [controls] = useState(() => {
    let pending: { id: number; view: Window; args: Args } | null = null;

    const cancel = () => {
      if (pending) {
        pending.view.cancelAnimationFrame(pending.id);
        pending = null;
      }
    };

    const schedule = (...args: Args) => {
      if (pending) {
        pending.args = args;

        return;
      }

      const view = windowRef.current ?? window;
      const next = { id: 0, view, args };

      next.id = view.requestAnimationFrame(() => {
        pending = null;
        callbackRef.current(...next.args);
      });
      pending = next;
    };

    return [schedule, cancel] as const;
  });

  const [, cancel] = controls;

  useEffect(() => cancel, [cancel]);

  return controls;
};

export default useAnimationFrameCallback;
