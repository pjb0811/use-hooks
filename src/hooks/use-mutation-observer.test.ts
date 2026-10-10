import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useMutationObserver from './use-mutation-observer';

// MutationObserver callbacks run in a microtask, so wait for one.
const change = (mutate: () => void) =>
  act(async () => {
    mutate();
    await Promise.resolve();
  });

describe('useMutationObserver', () => {
  let target: HTMLDivElement;

  beforeEach(() => {
    target = document.createElement('div');
    document.body.appendChild(target);
  });

  afterEach(() => {
    target.remove();
  });

  it('calls the callback when a watched node changes', async () => {
    const callback = vi.fn();

    renderHook(() =>
      useMutationObserver(target, callback, { childList: true }),
    );
    await change(() => target.appendChild(document.createElement('span')));

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0]?.[0][0].type).toBe('childList');
  });

  it('observes the element behind a ref', async () => {
    const callback = vi.fn();
    const ref = { current: target };

    renderHook(() => useMutationObserver(ref, callback, { childList: true }));
    await change(() => target.appendChild(document.createElement('span')));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('only reports the kinds of change that were asked for', async () => {
    const callback = vi.fn();

    renderHook(() =>
      useMutationObserver(target, callback, { attributes: true }),
    );
    await change(() => target.appendChild(document.createElement('span')));
    expect(callback).not.toHaveBeenCalled();

    await change(() => target.setAttribute('data-x', '1'));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not observe when disabled', async () => {
    const callback = vi.fn();

    renderHook(() =>
      useMutationObserver(target, callback, {
        childList: true,
        enabled: false,
      }),
    );
    await change(() => target.appendChild(document.createElement('span')));

    expect(callback).not.toHaveBeenCalled();
  });

  it('calls the callback from the latest render', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ callback }) =>
        useMutationObserver(target, callback, { childList: true }),
      { initialProps: { callback: first } },
    );

    rerender({ callback: second });
    await change(() => target.appendChild(document.createElement('span')));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('observes with new options when they change', async () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ options }) => useMutationObserver(target, callback, options),
      {
        initialProps: { options: { attributes: true } as MutationObserverInit },
      },
    );

    rerender({ options: { childList: true } });
    await change(() => target.setAttribute('data-x', '1'));
    expect(callback).not.toHaveBeenCalled();

    await change(() => target.appendChild(document.createElement('span')));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('stops observing on unmount', async () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() =>
      useMutationObserver(target, callback, { childList: true }),
    );

    unmount();
    await change(() => target.appendChild(document.createElement('span')));

    expect(callback).not.toHaveBeenCalled();
  });

  describe('a ref that is empty at first', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('starts observing once the ref is filled', async () => {
      const callback = vi.fn();
      const ref: { current: HTMLDivElement | null } = { current: null };

      renderHook(() => useMutationObserver(ref, callback, { childList: true }));

      ref.current = target;
      act(() => {
        vi.advanceTimersByTime(50);
      });
      await change(() => target.appendChild(document.createElement('span')));

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('stops waiting on unmount', () => {
      const ref: { current: HTMLDivElement | null } = { current: null };
      const { unmount } = renderHook(() =>
        useMutationObserver(ref, vi.fn(), { childList: true }),
      );

      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
