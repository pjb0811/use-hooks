import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useDebouncedValue from './use-debounced-value';

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value right away', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 100));

    expect(result.current).toBe('a');
  });

  it('returns the new value only after the delay has passed', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 100),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    advance(99);
    expect(result.current).toBe('a');

    advance(1);
    expect(result.current).toBe('b');
  });

  it('restarts the wait on every change and keeps only the last value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 100),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    advance(60);
    rerender({ value: 'c' });
    advance(60);
    expect(result.current).toBe('a');

    advance(40);
    expect(result.current).toBe('c');
  });

  it('uses a delay of 100ms by default', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    advance(99);
    expect(result.current).toBe('a');

    advance(1);
    expect(result.current).toBe('b');
  });

  it('drops a pending update on unmount', () => {
    const { rerender, unmount } = renderHook(
      ({ value }) => useDebouncedValue(value, 100),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    unmount();

    expect(() => advance(1000)).not.toThrow();
    expect(vi.getTimerCount()).toBe(0);
  });
});
