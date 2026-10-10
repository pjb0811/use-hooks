import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import useMultiSelect from './use-multi-select';

const sorted = (set: Set<number>) => [...set].sort((a, b) => a - b);

describe('useMultiSelect', () => {
  it('starts with nothing selected', () => {
    const { result } = renderHook(() => useMultiSelect(5));

    expect(sorted(result.current.selected)).toEqual([]);
    expect(result.current.isSelected(0)).toBe(false);
  });

  it('selects and deselects an index with toggle', () => {
    const { result } = renderHook(() => useMultiSelect(5));

    act(() => result.current.toggle(2));
    expect(result.current.isSelected(2)).toBe(true);

    act(() => result.current.toggle(2));
    expect(result.current.isSelected(2)).toBe(false);
  });

  it('keeps earlier selections when toggling another index', () => {
    const { result } = renderHook(() => useMultiSelect(5));

    act(() => result.current.toggle(1));
    act(() => result.current.toggle(3));

    expect(sorted(result.current.selected)).toEqual([1, 3]);
  });

  it('ignores an index outside the list', () => {
    const { result } = renderHook(() => useMultiSelect(3));

    act(() => result.current.toggle(-1));
    act(() => result.current.toggle(3));

    expect(sorted(result.current.selected)).toEqual([]);
  });

  it('selects the range from the anchor with shift', () => {
    const { result } = renderHook(() => useMultiSelect(10));

    act(() => result.current.toggle(2));
    act(() => result.current.toggle(5, true));

    expect(sorted(result.current.selected)).toEqual([2, 3, 4, 5]);
  });

  it('selects a range upwards from the anchor too', () => {
    const { result } = renderHook(() => useMultiSelect(10));

    act(() => result.current.toggle(6));
    act(() => result.current.toggle(3, true));

    expect(sorted(result.current.selected)).toEqual([3, 4, 5, 6]);
  });

  it('replaces the previous selection on a shift range and moves the anchor', () => {
    const { result } = renderHook(() => useMultiSelect(10));

    act(() => result.current.toggle(0));
    act(() => result.current.toggle(8));
    act(() => result.current.toggle(3));
    act(() => result.current.toggle(5, true));

    expect(sorted(result.current.selected)).toEqual([3, 4, 5]);

    act(() => result.current.toggle(7, true));
    expect(sorted(result.current.selected)).toEqual([5, 6, 7]);
  });

  it('acts like a plain toggle with shift when there is no anchor', () => {
    const { result } = renderHook(() => useMultiSelect(10));

    act(() => result.current.toggle(4, true));

    expect(sorted(result.current.selected)).toEqual([4]);
  });

  it('clears the selection and the anchor', () => {
    const { result } = renderHook(() => useMultiSelect(10));

    act(() => result.current.toggle(2));
    act(() => result.current.clear());
    expect(sorted(result.current.selected)).toEqual([]);

    act(() => result.current.toggle(5, true));
    expect(sorted(result.current.selected)).toEqual([5]);
  });

  it('replaces the selection and drops indices outside the list', () => {
    const { result } = renderHook(() => useMultiSelect(4));

    act(() => result.current.replace(new Set([0, 2, 3, 4, -1])));

    expect(sorted(result.current.selected)).toEqual([0, 2, 3]);
  });

  it('drops selected indices and the anchor when the list shrinks', () => {
    const { result, rerender } = renderHook(
      ({ count }) => useMultiSelect(count),
      { initialProps: { count: 10 } },
    );

    act(() => result.current.toggle(1));
    act(() => result.current.toggle(5));
    rerender({ count: 3 });

    expect(sorted(result.current.selected)).toEqual([1]);

    // The anchor (5) is gone, so shift does not select a range from it.
    act(() => result.current.toggle(2, true));
    expect(sorted(result.current.selected)).toEqual([1, 2]);
  });

  it('does not bring back dropped indices when the list grows again', () => {
    const { result, rerender } = renderHook(
      ({ count }) => useMultiSelect(count),
      { initialProps: { count: 10 } },
    );

    act(() => result.current.toggle(7));
    rerender({ count: 3 });
    rerender({ count: 10 });

    expect(sorted(result.current.selected)).toEqual([]);
  });
});
