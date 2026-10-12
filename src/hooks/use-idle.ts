import { useEffect, useRef, useState } from 'react';

const DEFAULT_EVENTS = [
  'pointermove',
  'pointerdown',
  'keydown',
  'wheel',
  'touchstart',
] as const;

interface Options {
  // Window events that count as activity.
  events?: readonly (keyof WindowEventMap)[];
  // Whether to start as idle.
  initialState?: boolean;
}

// Returns whether the user has done nothing for `timeout` ms. Activity is any
// of `events` on `window`, or the page becoming visible again. It only
// restarts the timer while the user is active, so moving the mouse doesn't
// render the component again. A new `timeout` restarts the timer.
const useIdle = (
  timeout: number,
  { events = DEFAULT_EVENTS, initialState = false }: Options = {},
) => {
  const [idle, setIdle] = useState(initialState);
  const idleRef = useRef(initialState);

  // A string, so an inline `events` array doesn't re-add the listeners on
  // every render.
  const eventsKey = events.join(' ');

  useEffect(() => {
    const eventList = eventsKey.split(' ').filter(Boolean);
    let timeoutId: ReturnType<typeof setTimeout>;

    const update = (next: boolean) => {
      if (idleRef.current !== next) {
        idleRef.current = next;
        setIdle(next);
      }
    };

    const onActivity = () => {
      clearTimeout(timeoutId);
      update(false);
      timeoutId = setTimeout(() => update(true), timeout);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        onActivity();
      }
    };

    timeoutId = setTimeout(() => update(true), timeout);

    eventList.forEach(type =>
      window.addEventListener(type, onActivity, { passive: true }),
    );
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      eventList.forEach(type => window.removeEventListener(type, onActivity));
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [timeout, eventsKey]);

  return idle;
};

export default useIdle;
