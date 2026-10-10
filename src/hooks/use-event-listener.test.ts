import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useEventListener from './use-event-listener';

describe('useEventListener', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('listens on window by default', () => {
    const handler = vi.fn();

    renderHook(() => useEventListener('resize', handler));
    window.dispatchEvent(new Event('resize'));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('listens on a document target', () => {
    const handler = vi.fn();

    renderHook(() =>
      useEventListener('visibilitychange', handler, { target: document }),
    );
    document.dispatchEvent(new Event('visibilitychange'));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('listens on the element behind a ref', () => {
    const element = document.createElement('div');
    const handler = vi.fn();

    renderHook(() =>
      useEventListener('click', handler, { target: { current: element } }),
    );
    element.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('calls the handler from the latest render without re-subscribing', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ handler }) => useEventListener('resize', handler),
      { initialProps: { handler: first } },
    );
    const addedBefore = add.mock.calls.filter(c => c[0] === 'resize').length;

    rerender({ handler: second });
    window.dispatchEvent(new Event('resize'));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(add.mock.calls.filter(c => c[0] === 'resize').length).toBe(
      addedBefore,
    );
  });

  it('does not listen when disabled, and starts when enabled', () => {
    const handler = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useEventListener('resize', handler, { enabled }),
      { initialProps: { enabled: false } },
    );

    window.dispatchEvent(new Event('resize'));
    expect(handler).not.toHaveBeenCalled();

    rerender({ enabled: true });
    window.dispatchEvent(new Event('resize'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('passes the listener options through', () => {
    const element = document.createElement('div');
    const handler = vi.fn();

    renderHook(() =>
      useEventListener('click', handler, {
        target: { current: element },
        once: true,
      }),
    );
    element.click();
    element.click();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('removes the listener on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useEventListener('resize', handler));

    unmount();
    window.dispatchEvent(new Event('resize'));

    expect(handler).not.toHaveBeenCalled();
  });

  describe('a ref that is empty at first', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('attaches once the ref is filled', () => {
      const element = document.createElement('div');
      const ref: { current: HTMLDivElement | null } = { current: null };
      const handler = vi.fn();

      renderHook(() => useEventListener('click', handler, { target: ref }));

      ref.current = element;
      act(() => {
        vi.advanceTimersByTime(50);
      });
      element.click();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('stops waiting on unmount', () => {
      const ref: { current: HTMLDivElement | null } = { current: null };
      const { unmount } = renderHook(() =>
        useEventListener('click', vi.fn(), { target: ref }),
      );

      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
