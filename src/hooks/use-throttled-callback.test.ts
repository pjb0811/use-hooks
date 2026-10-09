import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useThrottledCallback from './use-throttled-callback';

describe('useThrottledCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls right away on the first call, then once more with the last args', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 100));

    result.current('a');
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith('a');

    vi.advanceTimersByTime(30);
    result.current('b');
    vi.advanceTimersByTime(30);
    result.current('c');
    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(40);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('c');
  });

  it('calls right away again once the delay has passed', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 100));

    result.current('a');
    vi.advanceTimersByTime(100);
    result.current('b');

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('b');
  });

  it('skips the leading call with leading: false', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(callback, 100, { leading: false }),
    );

    result.current('a');
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith('a');
  });

  it('drops calls inside the window with trailing: false', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useThrottledCallback(callback, 100, { trailing: false }),
    );

    result.current('a');
    vi.advanceTimersByTime(50);
    result.current('b');
    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith('a');
  });

  it('keeps the same identity across renders', () => {
    const { result, rerender } = renderHook(() =>
      useThrottledCallback(vi.fn(), 100),
    );
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });

  it('calls the callback from the latest render', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(
      ({ callback }) => useThrottledCallback(callback, 100),
      { initialProps: { callback: first } },
    );

    rerender({ callback: second });
    result.current('a');

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('a');
  });

  it('drops a pending trailing call on unmount', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() =>
      useThrottledCallback(callback, 100),
    );

    result.current('a');
    result.current('b');
    unmount();
    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
