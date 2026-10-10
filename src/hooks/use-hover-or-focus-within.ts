import {
  type FocusEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import useLatest from './use-latest';

interface Options {
  // With `false` the hook returns no handlers and every flag stays `false`.
  enabled?: boolean;
  // Called when `active` changes, for callers that drive a timer instead of
  // rendering from state.
  onActiveChange?: (active: boolean) => void;
}

interface Handlers {
  onMouseEnter: (event: MouseEvent<HTMLElement>) => void;
  onMouseLeave: (event: MouseEvent<HTMLElement>) => void;
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  onBlur: (event: FocusEvent<HTMLElement>) => void;
}

const NO_HANDLERS: Partial<Handlers> = {};

// Tracks whether the pointer is over a container and whether focus is inside
// it, as two separate flags. `active` is true while either one is. Spread
// `handlers` onto the container. Leaving with the pointer does not end the
// state while focus is still inside, and the reverse.
const useHoverOrFocusWithin = ({
  enabled = true,
  onActiveChange,
}: Options = {}) => {
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);

  // Clears both flags in the render where `enabled` turns off, so they don't
  // come back stale when it turns on again.
  if (!enabled && (hovered || focusWithin)) {
    setHovered(false);
    setFocusWithin(false);
  }

  const active = enabled && (hovered || focusWithin);

  const onActiveChangeRef = useLatest(onActiveChange);
  const previousActiveRef = useRef(false);

  useEffect(() => {
    if (previousActiveRef.current === active) {
      return;
    }

    previousActiveRef.current = active;
    onActiveChangeRef.current?.(active);
  }, [active, onActiveChangeRef]);

  const onMouseEnter = useCallback(() => setHovered(true), []);
  const onMouseLeave = useCallback(() => setHovered(false), []);
  const onFocus = useCallback(() => setFocusWithin(true), []);

  // Moving focus between two elements inside the container fires `blur` and
  // then `focus`. A `blur` whose `relatedTarget` is still inside is ignored,
  // so `focusWithin` doesn't flip off and on.
  const onBlur = useCallback((event: FocusEvent<HTMLElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }

    setFocusWithin(false);
  }, []);

  const handlers = useMemo<Partial<Handlers>>(
    () =>
      enabled ? { onMouseEnter, onMouseLeave, onFocus, onBlur } : NO_HANDLERS,
    [enabled, onMouseEnter, onMouseLeave, onFocus, onBlur],
  );

  return {
    active,
    hovered: enabled && hovered,
    focusWithin: enabled && focusWithin,
    handlers,
  };
};

export default useHoverOrFocusWithin;
