import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import useToggle from './use-toggle';

describe('useToggle', () => {
  it('starts as false by default', () => {
    const { result } = renderHook(() => useToggle());

    expect(result.current[0]).toBe(false);
  });

  it('starts as the given initial value', () => {
    const { result } = renderHook(() => useToggle(true));

    expect(result.current[0]).toBe(true);
  });

  it('flips the value with toggle', () => {
    const { result } = renderHook(() => useToggle());

    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);

    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
  });

  it('sets an explicit value with the setter', () => {
    const { result } = renderHook(() => useToggle());

    act(() => result.current[2](true));
    expect(result.current[0]).toBe(true);

    act(() => result.current[2](true));
    expect(result.current[0]).toBe(true);
  });

  it('keeps toggle and the setter stable across renders', () => {
    const { result, rerender } = renderHook(() => useToggle());
    const [, toggle, setValue] = result.current;

    act(() => result.current[1]());
    rerender();

    expect(result.current[1]).toBe(toggle);
    expect(result.current[2]).toBe(setValue);
  });
});
