import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import useHistoryState from './use-history-state';

describe('useHistoryState', () => {
  it('starts with the initial value and no history', () => {
    const { result } = renderHook(() => useHistoryState(0));

    expect(result.current.value).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('records each change so it can be undone and redone', () => {
    const { result } = renderHook(() => useHistoryState(0));

    act(() => result.current.setValue(1));
    act(() => result.current.setValue(2));
    expect(result.current.value).toBe(2);
    expect(result.current.canUndo).toBe(true);

    act(() => result.current.undo());
    expect(result.current.value).toBe(1);
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.undo());
    expect(result.current.value).toBe(0);
    expect(result.current.canUndo).toBe(false);

    act(() => result.current.redo());
    act(() => result.current.redo());
    expect(result.current.value).toBe(2);
    expect(result.current.canRedo).toBe(false);
  });

  it('accepts a functional update', () => {
    const { result } = renderHook(() => useHistoryState(1));

    act(() => result.current.setValue(value => value + 10));

    expect(result.current.value).toBe(11);
  });

  it('ignores a value that equals the current one', () => {
    const { result } = renderHook(() => useHistoryState(1));

    act(() => result.current.setValue(1));

    expect(result.current.canUndo).toBe(false);
  });

  it('drops the redo history when a new value is set after an undo', () => {
    const { result } = renderHook(() => useHistoryState(0));

    act(() => result.current.setValue(1));
    act(() => result.current.undo());
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.setValue(5));

    expect(result.current.canRedo).toBe(false);
    expect(result.current.value).toBe(5);
  });

  it('does nothing on undo or redo when there is nothing to move to', () => {
    const { result } = renderHook(() => useHistoryState(0));

    act(() => result.current.undo());
    act(() => result.current.redo());

    expect(result.current.value).toBe(0);
  });

  it('keeps only the last `limit` entries in the past', () => {
    const { result } = renderHook(() => useHistoryState(0, { limit: 2 }));

    act(() => result.current.setValue(1));
    act(() => result.current.setValue(2));
    act(() => result.current.setValue(3));

    act(() => result.current.undo());
    act(() => result.current.undo());
    expect(result.current.value).toBe(1);
    expect(result.current.canUndo).toBe(false);
  });

  it('keeps no history with a limit of 0', () => {
    const { result } = renderHook(() => useHistoryState(0, { limit: 0 }));

    act(() => result.current.setValue(1));

    expect(result.current.value).toBe(1);
    expect(result.current.canUndo).toBe(false);
  });

  it('caps the redo history when the limit gets smaller', () => {
    const { result, rerender } = renderHook(
      ({ limit }) => useHistoryState(0, { limit }),
      { initialProps: { limit: 5 } },
    );

    act(() => result.current.setValue(1));
    act(() => result.current.setValue(2));
    act(() => result.current.setValue(3));
    rerender({ limit: 1 });

    act(() => result.current.undo());
    act(() => result.current.undo());
    act(() => result.current.redo());

    expect(result.current.value).toBe(2);
    expect(result.current.canRedo).toBe(false);
  });

  it('resets the value and clears both histories', () => {
    const { result } = renderHook(() => useHistoryState(0));

    act(() => result.current.setValue(1));
    act(() => result.current.setValue(2));
    act(() => result.current.undo());
    act(() => result.current.reset(9));

    expect(result.current.value).toBe(9);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('keeps the actions stable across renders', () => {
    const { result, rerender } = renderHook(() => useHistoryState(0));
    const { setValue, undo, redo, reset } = result.current;

    act(() => result.current.setValue(1));
    rerender();

    expect(result.current.setValue).toBe(setValue);
    expect(result.current.undo).toBe(undo);
    expect(result.current.redo).toBe(redo);
    expect(result.current.reset).toBe(reset);
  });
});
