import type { KeyboardEvent, PointerEvent } from 'react';

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useLongPress from './use-long-press';

const pointer = (init: Partial<PointerEvent<HTMLElement>> = {}) =>
  ({
    isPrimary: true,
    button: 0,
    clientX: 0,
    clientY: 0,
    ...init,
  }) as PointerEvent<HTMLElement>;

const key = (init: Partial<KeyboardEvent<HTMLElement>>) =>
  ({ repeat: false, ...init }) as KeyboardEvent<HTMLElement>;

describe('useLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires after the threshold', () => {
    const callback = vi.fn();
    const onStart = vi.fn();
    const { result } = renderHook(() =>
      useLongPress(callback, { threshold: 300, onStart }),
    );

    act(() => result.current.handlers.onPointerDown!(pointer()));
    expect(onStart).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(299));
    expect(callback).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it.each(['onPointerUp', 'onPointerLeave', 'onPointerCancel'] as const)(
    'cancels on %s before the threshold',
    handler => {
      const callback = vi.fn();
      const onCancel = vi.fn();
      const { result } = renderHook(() => useLongPress(callback, { onCancel }));

      act(() => result.current.handlers.onPointerDown!(pointer()));
      act(() => vi.advanceTimersByTime(200));
      act(() => result.current.handlers[handler]!());
      act(() => vi.advanceTimersByTime(1000));

      expect(callback).not.toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalledTimes(1);
    },
  );

  it('does not call onCancel when released after firing', () => {
    const onCancel = vi.fn();
    const { result } = renderHook(() => useLongPress(vi.fn(), { onCancel }));

    act(() => result.current.handlers.onPointerDown!(pointer()));
    act(() => vi.advanceTimersByTime(500));
    act(() => result.current.handlers.onPointerUp!());

    expect(onCancel).not.toHaveBeenCalled();
  });

  it('cancels when the pointer moves beyond moveTolerance', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useLongPress(callback, { moveTolerance: 10 }),
    );

    act(() => result.current.handlers.onPointerDown!(pointer()));
    act(() =>
      result.current.handlers.onPointerMove!(
        pointer({ clientX: 6, clientY: 6 }),
      ),
    );
    act(() => vi.advanceTimersByTime(100));
    act(() =>
      result.current.handlers.onPointerMove!(
        pointer({ clientX: 8, clientY: 8 }),
      ),
    );
    act(() => vi.advanceTimersByTime(1000));

    expect(callback).not.toHaveBeenCalled();
  });

  it('keeps a press that moves within moveTolerance', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useLongPress(callback, { moveTolerance: 10 }),
    );

    act(() => result.current.handlers.onPointerDown!(pointer()));
    act(() =>
      result.current.handlers.onPointerMove!(
        pointer({ clientX: 6, clientY: 6 }),
      ),
    );
    act(() => vi.advanceTimersByTime(500));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('ignores a non-primary button or pointer', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useLongPress(callback));

    act(() => result.current.handlers.onPointerDown!(pointer({ button: 2 })));
    act(() =>
      result.current.handlers.onPointerDown!(pointer({ isPrimary: false })),
    );
    act(() => vi.advanceTimersByTime(1000));

    expect(callback).not.toHaveBeenCalled();
  });

  it('handles holding Enter or Space with keyboard: true, ignoring repeats', () => {
    const callback = vi.fn();
    const onStart = vi.fn();
    const { result } = renderHook(() =>
      useLongPress(callback, { keyboard: true, onStart }),
    );

    act(() => result.current.handlers.onKeyDown!(key({ key: ' ' })));
    act(() => vi.advanceTimersByTime(300));
    act(() =>
      result.current.handlers.onKeyDown!(key({ key: ' ', repeat: true })),
    );
    act(() => vi.advanceTimersByTime(200));

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => result.current.handlers.onKeyUp!(key({ key: ' ' })));
    act(() => result.current.handlers.onKeyDown!(key({ key: 'Enter' })));
    act(() => result.current.handlers.onKeyUp!(key({ key: 'Enter' })));
    act(() => vi.advanceTimersByTime(1000));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancels a keyboard press when focus leaves', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useLongPress(callback, { keyboard: true }),
    );

    act(() => result.current.handlers.onKeyDown!(key({ key: 'Enter' })));
    act(() => result.current.handlers.onBlur!());
    act(() => vi.advanceTimersByTime(1000));

    expect(callback).not.toHaveBeenCalled();
  });

  it('returns no keyboard handlers without keyboard: true', () => {
    const { result } = renderHook(() => useLongPress(vi.fn()));

    expect(result.current.handlers.onKeyDown).toBeUndefined();
  });

  it.each(['onPointerUp', 'onPointerLeave', 'onPointerCancel'] as const)(
    'clears isLongPressed in the task after %s ends a long press',
    handler => {
      const { result } = renderHook(() => useLongPress(vi.fn()));

      act(() => result.current.handlers.onPointerDown!(pointer()));
      act(() => vi.advanceTimersByTime(500));
      act(() => result.current.handlers[handler]!());

      expect(result.current.isLongPressed()).toBe(true);

      act(() => vi.advanceTimersByTime(0));

      expect(result.current.isLongPressed()).toBe(false);
    },
  );

  it('clears isLongPressed in the task after keyup and blur end a long press', () => {
    const { result } = renderHook(() =>
      useLongPress(vi.fn(), { keyboard: true }),
    );

    act(() => result.current.handlers.onKeyDown!(key({ key: ' ' })));
    act(() => vi.advanceTimersByTime(500));
    act(() => result.current.handlers.onKeyUp!(key({ key: ' ' })));

    expect(result.current.isLongPressed()).toBe(true);

    act(() => vi.advanceTimersByTime(0));

    expect(result.current.isLongPressed()).toBe(false);

    act(() => result.current.handlers.onKeyDown!(key({ key: ' ' })));
    act(() => vi.advanceTimersByTime(500));
    act(() => result.current.handlers.onBlur!());
    act(() => vi.advanceTimersByTime(0));

    expect(result.current.isLongPressed()).toBe(false);
  });

  it('keeps isLongPressed false for a short press', () => {
    const { result } = renderHook(() => useLongPress(vi.fn()));

    act(() => result.current.handlers.onPointerDown!(pointer()));
    act(() => result.current.handlers.onPointerUp!());

    expect(result.current.isLongPressed()).toBe(false);
  });

  it('clears the reset timer on unmount', () => {
    const { result, unmount } = renderHook(() => useLongPress(vi.fn()));

    act(() => result.current.handlers.onPointerDown!(pointer()));
    act(() => vi.advanceTimersByTime(500));
    act(() => result.current.handlers.onPointerUp!());
    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it('resets isLongPressed when the next press starts', () => {
    const { result } = renderHook(() => useLongPress(vi.fn()));

    expect(result.current.isLongPressed()).toBe(false);

    act(() => result.current.handlers.onPointerDown!(pointer()));
    act(() => vi.advanceTimersByTime(500));
    act(() => result.current.handlers.onPointerUp!());
    expect(result.current.isLongPressed()).toBe(true);

    act(() => result.current.handlers.onPointerDown!(pointer()));
    act(() => result.current.handlers.onPointerUp!());
    expect(result.current.isLongPressed()).toBe(false);
  });

  it('returns no handlers and drops a waiting press when disabled', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(
      ({ enabled }) => useLongPress(callback, { enabled }),
      { initialProps: { enabled: true } },
    );

    act(() => result.current.handlers.onPointerDown!(pointer()));
    rerender({ enabled: false });
    act(() => vi.advanceTimersByTime(1000));

    expect(callback).not.toHaveBeenCalled();
    expect(result.current.handlers).toEqual({});
  });

  it('keeps the same handlers across rerenders with inline callbacks', () => {
    const { result, rerender } = renderHook(() =>
      useLongPress(() => undefined, { onStart: () => undefined }),
    );
    const first = result.current.handlers;

    rerender();

    expect(result.current.handlers).toBe(first);
  });

  it('calls the latest callback', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(
      ({ callback }) => useLongPress(callback),
      { initialProps: { callback: first } },
    );

    act(() => result.current.handlers.onPointerDown!(pointer()));
    rerender({ callback: second });
    act(() => vi.advanceTimersByTime(500));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('clears the timer on unmount', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useLongPress(callback));

    act(() => result.current.handlers.onPointerDown!(pointer()));
    unmount();
    vi.advanceTimersByTime(1000);

    expect(callback).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
