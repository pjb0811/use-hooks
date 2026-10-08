import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useTimeout from './use-timeout';

describe('useTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls the callback once after the delay', () => {
    const callback = vi.fn();

    renderHook(() => useTimeout(callback, 100));

    vi.advanceTimersByTime(99);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('schedules nothing when the delay is null', () => {
    const callback = vi.fn();

    renderHook(() => useTimeout(callback, null));
    vi.advanceTimersByTime(1000);

    expect(callback).not.toHaveBeenCalled();
  });

  it('treats a delay of 0 as a real delay, not as inactive', () => {
    const callback = vi.fn();

    renderHook(() => useTimeout(callback, 0));
    vi.advanceTimersByTime(1);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('restarts the timer when the delay changes', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ delay }) => useTimeout(callback, delay),
      { initialProps: { delay: 100 } },
    );

    vi.advanceTimersByTime(60);
    rerender({ delay: 200 });
    vi.advanceTimersByTime(199);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('restarts the timer from now with reset', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, 100));

    vi.advanceTimersByTime(80);
    act(() => result.current.reset());
    vi.advanceTimersByTime(80);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(20);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancels the pending call with clear, and reset starts it again', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useTimeout(callback, 100));

    act(() => result.current.clear());
    vi.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();

    act(() => result.current.reset());
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls the callback from the latest render without restarting', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ callback }) => useTimeout(callback, 100),
      {
        initialProps: { callback: first },
      },
    );

    vi.advanceTimersByTime(50);
    rerender({ callback: second });
    vi.advanceTimersByTime(50);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('cancels the pending call on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useTimeout(callback, 100));

    unmount();
    vi.advanceTimersByTime(1000);

    expect(callback).not.toHaveBeenCalled();
  });
});
