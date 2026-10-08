import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useThrottledValue from './use-throttled-value';

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('useThrottledValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value', () => {
    const { result } = renderHook(() => useThrottledValue('a', 100));

    expect(result.current).toBe('a');
  });

  it('holds a change made inside the window until the window ends', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottledValue(value, 100),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    expect(result.current).toBe('a');

    advance(99);
    expect(result.current).toBe('a');

    advance(1);
    expect(result.current).toBe('b');
  });

  it('applies a change right away once the window has passed', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottledValue(value, 100),
      { initialProps: { value: 'a' } },
    );

    advance(100);
    rerender({ value: 'b' });

    expect(result.current).toBe('b');
  });

  it('ends on the last value of a burst', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottledValue(value, 100),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    advance(30);
    rerender({ value: 'c' });
    advance(30);
    rerender({ value: 'd' });
    advance(100);

    expect(result.current).toBe('d');
  });

  it('never applies a change inside the window with trailing: false', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottledValue(value, 100, { trailing: false }),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    advance(1000);

    expect(result.current).toBe('a');
  });
});
