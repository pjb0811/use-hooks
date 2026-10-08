import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useRecursiveTimeout from './use-recursive-timeout';

const advance = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

describe('useRecursiveTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('schedules the next tick after a synchronous callback', async () => {
    const callback = vi.fn();

    renderHook(() => useRecursiveTimeout(callback, 100));

    await advance(100);
    expect(callback).toHaveBeenCalledTimes(1);

    await advance(200);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('does not run when the delay is null', async () => {
    const callback = vi.fn();

    renderHook(() => useRecursiveTimeout(callback, null));
    await advance(1000);

    expect(callback).not.toHaveBeenCalled();
  });

  it('waits for a returned promise before scheduling the next tick', async () => {
    let resolve: () => void = () => {};
    const callback = vi.fn(
      () =>
        new Promise<void>(res => {
          resolve = res;
        }),
    );

    renderHook(() => useRecursiveTimeout(callback, 100));

    await advance(100);
    expect(callback).toHaveBeenCalledTimes(1);

    await advance(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolve();
    });
    await advance(100);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('logs a rejection and keeps going by default', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const callback = vi.fn(() => Promise.reject(new Error('fail')));

    renderHook(() => useRecursiveTimeout(callback, 100));

    await advance(100);
    expect(error).toHaveBeenCalledTimes(1);

    await advance(100);
    expect(callback).toHaveBeenCalledTimes(2);

    error.mockRestore();
  });

  it('stops after a rejection with stopOnError', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const callback = vi.fn(() => Promise.reject(new Error('fail')));

    renderHook(() => useRecursiveTimeout(callback, 100, { stopOnError: true }));

    await advance(100);
    await advance(1000);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);

    error.mockRestore();
  });

  it('calls the callback from the latest render', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ callback }) => useRecursiveTimeout(callback, 100),
      { initialProps: { callback: first } },
    );

    await advance(50);
    rerender({ callback: second });
    await advance(50);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('stops on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useRecursiveTimeout(callback, 100));

    unmount();
    await advance(1000);

    expect(callback).not.toHaveBeenCalled();
  });
});
