import {
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import useLatest from './use-latest';

interface Options {
  // How long the press has to last, in ms.
  threshold?: number;
  // How far the pointer may move from where it went down before the press is
  // cancelled, in px, so a scroll gesture on a touch screen doesn't count.
  moveTolerance?: number;
  // Also treat holding Enter or Space on the focused element as a press.
  keyboard?: boolean;
  // With `false` the hook returns no handlers.
  enabled?: boolean;
  // Called when a press starts.
  onStart?: () => void;
  // Called when a press ends before `threshold`.
  onCancel?: () => void;
}

interface Handlers {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  onPointerCancel: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onKeyUp: (event: KeyboardEvent<HTMLElement>) => void;
  onBlur: () => void;
}

const NO_HANDLERS: Partial<Handlers> = {};

const isPressKey = (key: string) => key === 'Enter' || key === ' ';

// Calls `callback` once a press on the element lasts `threshold` ms. Spread
// `handlers` onto the element. Pointer events cover mouse, touch and pen;
// only the primary button starts a press. Releasing, leaving, a
// `pointercancel` or moving past `moveTolerance` before then cancels it.
//
// `isLongPressed()` is true from the moment `callback` fires until the next
// press starts, so a click handler can skip the click that ends a long
// press. On a `<button>`, Enter fires `click` on keydown, before any long
// press, so only Space can be told apart that way.
const useLongPress = (
  callback: () => void,
  {
    threshold = 500,
    moveTolerance = 10,
    keyboard = false,
    enabled = true,
    onStart,
    onCancel,
  }: Options = {},
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressedRef = useRef(false);

  const callbackRef = useLatest(callback);
  const thresholdRef = useLatest(threshold);
  const moveToleranceRef = useLatest(moveTolerance);
  const onStartRef = useLatest(onStart);
  const onCancelRef = useLatest(onCancel);

  const result = useMemo(() => {
    const start = (point: { x: number; y: number } | null) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      isLongPressedRef.current = false;
      startPointRef.current = point;
      onStartRef.current?.();

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        isLongPressedRef.current = true;
        callbackRef.current();
      }, thresholdRef.current);
    };

    // Only a press that is still waiting is cancelled.
    const cancel = () => {
      if (!timeoutRef.current) {
        return;
      }

      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      onCancelRef.current?.();
    };

    const pointerHandlers = {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (!event.isPrimary || event.button !== 0) {
          return;
        }

        start({ x: event.clientX, y: event.clientY });
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        const point = startPointRef.current;

        if (!timeoutRef.current || !point) {
          return;
        }

        const distance = Math.hypot(
          event.clientX - point.x,
          event.clientY - point.y,
        );

        if (distance > moveToleranceRef.current) {
          cancel();
        }
      },
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
    };

    const keyboardHandlers = {
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (isPressKey(event.key) && !event.repeat) {
          start(null);
        }
      },
      onKeyUp: (event: KeyboardEvent<HTMLElement>) => {
        if (isPressKey(event.key)) {
          cancel();
        }
      },
      onBlur: cancel,
    };

    const handlers: Partial<Handlers> = !enabled
      ? NO_HANDLERS
      : keyboard
        ? { ...pointerHandlers, ...keyboardHandlers }
        : pointerHandlers;

    return {
      handlers,
      isLongPressed: () => isLongPressedRef.current,
    };
  }, [
    enabled,
    keyboard,
    callbackRef,
    thresholdRef,
    moveToleranceRef,
    onStartRef,
    onCancelRef,
  ]);

  // Drops a waiting press when the hook is disabled or unmounts.
  useEffect(() => {
    if (enabled) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [enabled]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return result;
};

export default useLongPress;
