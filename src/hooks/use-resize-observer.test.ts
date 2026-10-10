import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type FakeResizeObserver,
  installResizeObserver,
  lastOf,
} from '../test-utils/observers';
import useResizeObserver from './use-resize-observer';

describe('useResizeObserver', () => {
  let Observer: typeof FakeResizeObserver;
  let node: HTMLDivElement;

  beforeEach(() => {
    Observer = installResizeObserver();
    node = document.createElement('div');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts with no size and no observer', () => {
    const { result } = renderHook(() => useResizeObserver());

    expect(result.current[1]).toBeNull();
    expect(Observer.instances).toHaveLength(0);
  });

  it('observes the node given to the callback ref', () => {
    const { result } = renderHook(() => useResizeObserver());

    act(() => result.current[0](node));

    expect(lastOf(Observer.instances).observed.has(node)).toBe(true);
    expect(lastOf(Observer.instances).lastOptions).toEqual({
      box: 'content-box',
    });
  });

  it('reports the content box size', () => {
    const { result } = renderHook(() => useResizeObserver());

    act(() => result.current[0](node));
    act(() =>
      lastOf(Observer.instances).trigger([
        {
          contentBoxSize: [{ inlineSize: 120, blockSize: 40 }],
          borderBoxSize: [{ inlineSize: 130, blockSize: 50 }],
        },
      ]),
    );

    expect(result.current[1]).toEqual({ width: 120, height: 40 });
  });

  it('reports the border box size with box: border-box', () => {
    const { result } = renderHook(() =>
      useResizeObserver({ box: 'border-box' }),
    );

    act(() => result.current[0](node));
    act(() =>
      lastOf(Observer.instances).trigger([
        {
          contentBoxSize: [{ inlineSize: 120, blockSize: 40 }],
          borderBoxSize: [{ inlineSize: 130, blockSize: 50 }],
        },
      ]),
    );

    expect(result.current[1]).toEqual({ width: 130, height: 50 });
  });

  it('falls back to contentRect when the box sizes are empty', () => {
    const { result } = renderHook(() => useResizeObserver());

    act(() => result.current[0](node));
    act(() =>
      lastOf(Observer.instances).trigger([
        {
          contentBoxSize: [],
          contentRect: { width: 0, height: 0 } as DOMRectReadOnly,
        },
      ]),
    );

    expect(result.current[1]).toEqual({ width: 0, height: 0 });
  });

  it('ignores a callback without entries', () => {
    const { result } = renderHook(() => useResizeObserver());

    act(() => result.current[0](node));
    act(() => lastOf(Observer.instances).trigger([]));

    expect(result.current[1]).toBeNull();
  });

  it('reconnects with the new box when `box` changes', () => {
    const { result, rerender } = renderHook(
      ({ box }) => useResizeObserver({ box }),
      { initialProps: { box: 'content-box' as ResizeObserverBoxOptions } },
    );

    act(() => result.current[0](node));
    const first = lastOf(Observer.instances);

    rerender({ box: 'border-box' });

    expect(first.disconnected).toBe(true);
    expect(lastOf(Observer.instances).lastOptions).toEqual({
      box: 'border-box',
    });
  });

  it('does not reconnect for a new options object with the same box', () => {
    const { result, rerender } = renderHook(() =>
      useResizeObserver({ box: 'content-box' }),
    );

    act(() => result.current[0](node));
    const count = Observer.instances.length;

    rerender();

    expect(Observer.instances).toHaveLength(count);
  });

  it('disconnects when the node is released', () => {
    const { result } = renderHook(() => useResizeObserver());

    act(() => result.current[0](node));
    const observer = lastOf(Observer.instances);

    act(() => result.current[0](null));

    expect(observer.disconnected).toBe(true);
  });

  it('disconnects on unmount', () => {
    const { result, unmount } = renderHook(() => useResizeObserver());

    act(() => result.current[0](node));
    const observer = lastOf(Observer.instances);

    unmount();

    expect(observer.disconnected).toBe(true);
  });

  it('keeps the callback ref stable across renders', () => {
    const { result, rerender } = renderHook(() => useResizeObserver());
    const first = result.current[0];

    rerender();

    expect(result.current[0]).toBe(first);
  });

  it('does not throw where ResizeObserver does not exist', () => {
    vi.unstubAllGlobals();

    const { result } = renderHook(() => useResizeObserver());

    expect(() => act(() => result.current[0](node))).not.toThrow();
  });
});
