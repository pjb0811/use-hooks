import {
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import useControllableState from './use-controllable-state';
import useLatest from './use-latest';

interface Options {
  // Initial size of the first pane, in percent of the container. Ignored
  // while `size` is passed.
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  // `'horizontal'` lays the panes side by side and measures the container's
  // width; `'vertical'` stacks them and measures its height.
  orientation?: 'horizontal' | 'vertical';
  // Percent moved per arrow key press.
  keyboardStep?: number;
  // Controlled size. With it, the hook only reports changes through
  // `onSizeChange` and never changes the size on its own.
  size?: number;
  // Called on every change, including each pointer move during a drag.
  onSizeChange?: (size: number) => void;
  // Called once when a drag or key press that changed the size ends, e.g. to
  // persist it.
  onResizeEnd?: (size: number) => void;
}

interface SeparatorProps {
  role: 'separator';
  tabIndex: 0;
  // The orientation of the separator line, which is the opposite of the
  // layout's.
  'aria-orientation': 'horizontal' | 'vertical';
  'aria-valuenow': number;
  'aria-valuemin': number;
  'aria-valuemax': number;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

const round = (value: number) => Math.round(value * 10) / 10;

const isRtl = (element: HTMLElement | null) =>
  element !== null && getComputedStyle(element).direction === 'rtl';

// Resizes the first of two panes with a separator between them, by pointer
// (mouse, touch or pen) or keyboard. Attach `containerRef` to the element the
// percentages refer to, and spread `separatorProps` onto the separator; add
// its `aria-label`, `aria-controls` and `touch-action: none` yourself.
//
// Sizes are percentages of the container, clamped to `[minSize, maxSize]` and
// rounded to 0.1. Arrow keys step by `keyboardStep` (Left/Right side by side,
// Up/Down stacked), and Home and End jump to the limits. Side by side in a
// right-to-left container, the first pane starts at the right edge, so the
// size is measured from there and Left and Right swap. The handlers keep
// their identity across renders.
const useSplitResize = ({
  defaultSize = 50,
  minSize = 0,
  maxSize = 100,
  orientation = 'horizontal',
  keyboardStep = 1,
  size: sizeProp,
  onSizeChange,
  onResizeEnd,
}: Options = {}) => {
  const [size, setSize] = useControllableState({
    value: sizeProp,
    defaultValue: defaultSize,
    onChange: onSizeChange,
  });
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);
  // The drag in progress: the size when it started, the size it last asked
  // for, and whether the container is right-to-left.
  const dragRef = useRef<{
    startSize: number;
    lastSize: number;
    isRtl: boolean;
  } | null>(null);

  const latestRef = useLatest({
    size,
    setSize,
    minSize,
    maxSize,
    orientation,
    keyboardStep,
    onResizeEnd,
  });

  const handlers = useMemo(() => {
    const clamp = (value: number) => {
      const { minSize: min, maxSize: max } = latestRef.current;

      return round(Math.min(max, Math.max(min, value)));
    };

    const stop = (event: PointerEvent<HTMLElement>) => {
      const drag = dragRef.current;

      if (!drag) {
        return;
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      dragRef.current = null;
      setIsResizing(false);

      if (drag.lastSize !== drag.startSize) {
        latestRef.current.onResizeEnd?.(drag.lastSize);
      }
    };

    return {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (event.button !== 0) {
          return;
        }

        // Capture keeps the moves coming when the pointer leaves the
        // separator, and preventDefault stops text selection during the drag.
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);

        const { size: current } = latestRef.current;

        dragRef.current = {
          startSize: current,
          lastSize: current,
          isRtl: isRtl(containerRef.current),
        };
        setIsResizing(true);
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        const drag = dragRef.current;
        const rect = containerRef.current?.getBoundingClientRect();

        if (!drag || !rect) {
          return;
        }

        const isVertical = latestRef.current.orientation === 'vertical';
        const length = isVertical ? rect.height : rect.width;

        if (length === 0) {
          return;
        }

        let offset = event.clientX - rect.left;

        if (isVertical) {
          offset = event.clientY - rect.top;
        } else if (drag.isRtl) {
          offset = rect.right - event.clientX;
        }

        const next = clamp((offset / length) * 100);

        if (next !== drag.lastSize) {
          drag.lastSize = next;
          latestRef.current.setSize(next);
        }
      },
      onPointerUp: stop,
      onPointerCancel: stop,
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        const {
          size: current,
          minSize: min,
          maxSize: max,
          orientation: layout,
          keyboardStep: step,
        } = latestRef.current;
        const isVertical = layout === 'vertical';
        const sign = !isVertical && isRtl(containerRef.current) ? -1 : 1;
        const target: Record<string, number> = isVertical
          ? { ArrowUp: current - step, ArrowDown: current + step }
          : {
              ArrowLeft: current - step * sign,
              ArrowRight: current + step * sign,
            };
        const requested = { ...target, Home: min, End: max }[event.key];

        if (requested === undefined) {
          return;
        }

        event.preventDefault();

        const next = clamp(requested);

        if (next !== current) {
          latestRef.current.setSize(next);
          latestRef.current.onResizeEnd?.(next);
        }
      },
    };
  }, [latestRef]);

  const setContainer = useCallback((element: HTMLElement | null) => {
    containerRef.current = element;
  }, []);

  const separatorProps: SeparatorProps = {
    role: 'separator',
    tabIndex: 0,
    'aria-orientation': orientation === 'vertical' ? 'horizontal' : 'vertical',
    'aria-valuenow': size,
    'aria-valuemin': minSize,
    'aria-valuemax': maxSize,
    ...handlers,
  };

  return {
    size,
    isResizing,
    // A callback ref, so it fits any element type.
    containerRef: setContainer,
    separatorProps,
  };
};

export default useSplitResize;
