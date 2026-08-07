import { type RefObject, useEffect, useRef } from 'react';

type ClickOutsideRef = RefObject<HTMLElement | null> | null | undefined;

type ClickOutsideEvent = PointerEvent | MouseEvent | TouchEvent | KeyboardEvent;

interface Options {
  enabled?: boolean;
  events?: ('pointerdown' | 'mousedown' | 'touchstart')[];
  escape?: boolean;
}

// Takes the "inside" ref(s) as an argument instead of creating and
// returning one — lets a caller pass multiple exclusion targets (e.g. a
// dropdown's trigger button *and* its portaled panel, which live in
// different DOM subtrees) instead of only ever watching one element.
const useClickOutside = (
  refs: ClickOutsideRef | ClickOutsideRef[],
  handler: (event: ClickOutsideEvent) => void,
  options: Options = {},
) => {
  const { enabled = true, events = ['pointerdown'], escape = true } = options;

  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  const refList = Array.isArray(refs) ? refs : [refs];
  // `refs` is almost always an inline array literal at the call site, so
  // depending on it directly would tear down/rebuild the listeners on
  // every render — read the latest value from a ref instead.
  const refListRef = useRef(refList);

  useEffect(() => {
    refListRef.current = refList;
  });

  const eventsKey = events.join(',');

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      return;
    }

    const isInside = (target: Node) =>
      refListRef.current.some(ref => ref?.current?.contains(target));

    const onPointerEvent = (event: Event) => {
      const target = event.target as Node | null;

      if (!target || isInside(target)) {
        return;
      }

      handlerRef.current(event as ClickOutsideEvent);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handlerRef.current(event);
      }
    };

    events.forEach(eventName => {
      document.addEventListener(eventName, onPointerEvent);
    });

    if (escape) {
      document.addEventListener('keydown', onKeyDown);
    }

    return () => {
      events.forEach(eventName => {
        document.removeEventListener(eventName, onPointerEvent);
      });

      if (escape) {
        document.removeEventListener('keydown', onKeyDown);
      }
    };
    // `events` is covered by `eventsKey` below instead of the array
    // itself, which (like `refs`) is usually a fresh literal every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, escape, eventsKey]);
};

export default useClickOutside;
