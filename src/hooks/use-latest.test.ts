import { useEffect } from 'react';

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useLatest from './use-latest';

describe('useLatest', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('holds the initial value on the first render', () => {
    const { result } = renderHook(() => useLatest('a'));

    expect(result.current.current).toBe('a');
  });

  it('follows the value after a rerender', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'b' });

    expect(result.current.current).toBe('b');
  });

  it('keeps the same ref across rerenders', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 'a' },
    });
    const first = result.current;

    rerender({ value: 'b' });

    expect(result.current).toBe(first);
  });

  it('still holds the previous value while the next render runs', () => {
    const seen: string[] = [];
    const { rerender } = renderHook(
      ({ value }) => {
        const ref = useLatest(value);

        seen.push(ref.current);
      },
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });

    expect(seen).toEqual(['a', 'a']);
  });

  it('lets a timer created once read the newest value', () => {
    const readings: number[] = [];
    const { rerender } = renderHook(
      ({ value }) => {
        const ref = useLatest(value);

        useEffect(() => {
          const id = setInterval(() => readings.push(ref.current), 100);

          return () => clearInterval(id);
        }, [ref]);
      },
      { initialProps: { value: 1 } },
    );

    act(() => vi.advanceTimersByTime(100));
    rerender({ value: 2 });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: 3 });
    act(() => vi.advanceTimersByTime(100));

    expect(readings).toEqual([1, 2, 3]);
    expect(vi.getTimerCount()).toBe(1);
  });
});
