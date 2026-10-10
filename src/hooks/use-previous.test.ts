import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import usePrevious from './use-previous';

describe('usePrevious', () => {
  it('returns undefined on the first render', () => {
    const { result } = renderHook(() => usePrevious('a'));

    expect(result.current).toBeUndefined();
  });

  it('returns the value from the previous render', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 3 });
    expect(result.current).toBe(2);
  });

  it('returns the same value again when a rerender does not change it', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });
    rerender({ value: 2 });

    expect(result.current).toBe(2);
  });
});
