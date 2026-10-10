import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type FakeResizeObserver,
  installResizeObserver,
  lastOf,
} from '../test-utils/observers';
import useElementPosition from './use-element-position';

const rect = (top: number, left = 0, width = 100, height = 50) =>
  ({
    x: left,
    y: top,
    top,
    left,
    width,
    height,
    right: left + width,
    bottom: top + height,
  }) as DOMRect;

describe('useElementPosition', () => {
  let Observer: typeof FakeResizeObserver;
  let element: HTMLDivElement;
  let current: DOMRect;

  beforeEach(() => {
    vi.useFakeTimers();
    Observer = installResizeObserver();
    current = rect(10);
    element = document.createElement('div');
    document.body.appendChild(element);
    vi.spyOn(element, 'getBoundingClientRect').mockImplementation(() =>
      rect(current.top, current.left, current.width, current.height),
    );
  });

  afterEach(() => {
    element.remove();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('reads the rect of the element behind a ref on mount', () => {
    const ref = { current: element };
    const { result } = renderHook(() => useElementPosition(ref));

    expect(result.current).toMatchObject({ top: 10, width: 100, height: 50 });
  });

  it('is null while the ref is empty', () => {
    const ref: { current: HTMLDivElement | null } = { current: null };
    const { result } = renderHook(() => useElementPosition(ref));

    expect(result.current).toBeNull();
  });

  it('finds the element by a selector', () => {
    element.id = 'target';

    const { result } = renderHook(() => useElementPosition('#target'));

    expect(result.current).toMatchObject({ top: 10 });
  });

  it('updates on the next frame after a scroll', () => {
    const ref = { current: element };
    const { result } = renderHook(() => useElementPosition(ref));

    act(() => {
      current = rect(40);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current?.top).toBe(10);

    act(() => {
      vi.advanceTimersByTime(20);
    });
    expect(result.current?.top).toBe(40);
  });

  it('measures once per frame however many events arrive', () => {
    const ref = { current: element };

    renderHook(() => useElementPosition(ref));

    const getRect = vi.mocked(element.getBoundingClientRect);
    const before = getRect.mock.calls.length;

    act(() => {
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new Event('resize'));
      element.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(20);
    });

    expect(getRect.mock.calls.length - before).toBe(1);
  });

  it('measures again on the next frame after a burst', () => {
    const ref = { current: element };
    const { result } = renderHook(() => useElementPosition(ref));

    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(20);
    });
    act(() => {
      current = rect(90);
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(20);
    });

    expect(result.current?.top).toBe(90);
  });

  it('drops a pending measurement on unmount', () => {
    const ref = { current: element };
    const { unmount } = renderHook(() => useElementPosition(ref));
    const getRect = vi.mocked(element.getBoundingClientRect);

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    const before = getRect.mock.calls.length;

    unmount();
    act(() => {
      vi.advanceTimersByTime(20);
    });

    expect(getRect.mock.calls.length).toBe(before);
  });

  it('also catches the scroll of an ancestor container', () => {
    const ref = { current: element };
    const { result } = renderHook(() => useElementPosition(ref));
    const container = document.createElement('div');

    container.appendChild(element);
    document.body.appendChild(container);

    act(() => {
      current = rect(70);
      element.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(20);
    });

    expect(result.current?.top).toBe(70);

    container.remove();
  });

  it('updates after a window resize', () => {
    const ref = { current: element };
    const { result } = renderHook(() => useElementPosition(ref));

    act(() => {
      current = rect(10, 0, 300, 80);
      window.dispatchEvent(new Event('resize'));
      vi.advanceTimersByTime(20);
    });

    expect(result.current).toMatchObject({ width: 300, height: 80 });
  });

  it('keeps the same rect object when nothing changed', () => {
    const ref = { current: element };
    const { result } = renderHook(() => useElementPosition(ref));
    const before = result.current;

    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(20);
    });

    expect(result.current).toBe(before);
  });

  it('watches the size of the element with a ResizeObserver', () => {
    const ref = { current: element };
    const { result } = renderHook(() => useElementPosition(ref));

    expect(lastOf(Observer.instances).observed.has(element)).toBe(true);

    act(() => {
      current = rect(10, 0, 500, 50);
      lastOf(Observer.instances).trigger();
    });

    expect(result.current?.width).toBe(500);
  });

  it('picks up a selector target that is added later', async () => {
    vi.useRealTimers();

    const { result } = renderHook(() => useElementPosition('#late'));

    expect(result.current).toBeNull();

    await act(async () => {
      element.id = 'late';
      document.body.appendChild(document.createElement('i'));
      await new Promise(resolve => setTimeout(resolve, 50));
    });

    expect(result.current).toMatchObject({ top: 10 });
  });

  it('removes its listeners and observers on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const ref = { current: element };
    const { unmount } = renderHook(() => useElementPosition(ref));
    const observer = lastOf(Observer.instances);

    unmount();

    expect(remove.mock.calls.map(call => call[0])).toEqual(
      expect.arrayContaining(['scroll', 'resize']),
    );
    expect(observer.disconnected).toBe(true);
  });
});
