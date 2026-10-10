import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useViewport from './use-viewport';

const setWindow = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: height,
  });
};

describe('useViewport', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setWindow(1024, 768);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('reads the viewport on mount', () => {
    const { result } = renderHook(() => useViewport());

    expect(result.current).toMatchObject({
      width: 1024,
      height: 768,
      scale: 1,
    });
  });

  it('updates after a resize once the debounce has passed', () => {
    const { result } = renderHook(() => useViewport({ debounce: 100 }));

    act(() => {
      setWindow(800, 600);
      window.dispatchEvent(new Event('resize'));
    });
    act(() => {
      vi.advanceTimersByTime(99);
    });
    expect(result.current.width).toBe(1024);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toMatchObject({ width: 800, height: 600 });
  });

  it('keeps the same object when nothing changed', () => {
    const { result } = renderHook(() => useViewport({ debounce: 10 }));
    const before = result.current;

    act(() => {
      window.dispatchEvent(new Event('resize'));
      vi.advanceTimersByTime(10);
    });

    expect(result.current).toBe(before);
  });

  it('does not react to focus or blur outside in-app mode', () => {
    const { result } = renderHook(() => useViewport());

    act(() => {
      setWindow(500, 400);
      window.dispatchEvent(new Event('blur'));
    });

    expect(result.current.width).toBe(1024);
  });

  it('updates right away on blur in in-app mode', () => {
    const { result } = renderHook(() => useViewport({ isInApp: true }));

    act(() => {
      setWindow(500, 400);
      window.dispatchEvent(new Event('blur'));
    });

    expect(result.current.width).toBe(500);
  });

  it('notices a large height change in in-app mode by polling', () => {
    const { result } = renderHook(() => useViewport({ isInApp: true }));

    act(() => {
      setWindow(1024, 400);
      vi.advanceTimersByTime(500);
    });

    expect(result.current.height).toBe(400);
  });

  it('removes its listeners and timers on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useViewport({ isInApp: true }));

    unmount();

    expect(remove.mock.calls.map(call => call[0])).toEqual(
      expect.arrayContaining(['resize', 'orientationchange', 'blur']),
    );
    expect(vi.getTimerCount()).toBe(0);
  });
});
