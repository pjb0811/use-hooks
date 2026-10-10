import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useWindowScroll from './use-window-scroll';

const setScroll = ({
  x = 0,
  y = 0,
  scrollWidth = 1024,
  scrollHeight = 768,
}: {
  x?: number;
  y?: number;
  scrollWidth?: number;
  scrollHeight?: number;
}) => {
  Object.defineProperty(window, 'scrollX', { configurable: true, value: x });
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
  Object.defineProperty(document.documentElement, 'scrollWidth', {
    configurable: true,
    value: scrollWidth,
  });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
};

describe('useWindowScroll', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 768,
    });
    setScroll({});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('reads the current position and percentage on mount', () => {
    setScroll({ y: 500, scrollHeight: 2768 });

    const { result } = renderHook(() => useWindowScroll());

    expect(result.current).toEqual({
      x: 0,
      y: 500,
      percent: { x: 0, y: 25 },
    });
  });

  it('reports 0 percent when the page does not scroll', () => {
    const { result } = renderHook(() => useWindowScroll());

    expect(result.current.percent).toEqual({ x: 0, y: 0 });
  });

  it('updates on scroll, capped at 100 percent', () => {
    setScroll({ scrollHeight: 1768 });
    const { result } = renderHook(() => useWindowScroll());

    act(() => {
      setScroll({ y: 500, scrollHeight: 1768 });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.y).toBe(500);
    expect(result.current.percent.y).toBe(50);

    act(() => {
      setScroll({ y: 5000, scrollHeight: 1768 });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.percent.y).toBe(100);
  });

  it('measures again shortly after a resize', () => {
    const { result } = renderHook(() => useWindowScroll());

    act(() => {
      setScroll({ y: 100, scrollHeight: 1768 });
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.y).toBe(0);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.y).toBe(100);
    expect(result.current.percent.y).toBe(10);
  });

  it('follows the window of the element behind a ref', () => {
    const element = document.createElement('div');

    document.body.appendChild(element);
    setScroll({ y: 200, scrollHeight: 1768 });

    const ref = { current: element };
    const { result } = renderHook(() => useWindowScroll(ref));

    expect(result.current.y).toBe(200);

    element.remove();
  });

  it('waits for an empty ref to be filled', () => {
    const element = document.createElement('div');
    const ref: { current: HTMLDivElement | null } = { current: null };

    document.body.appendChild(element);
    setScroll({ y: 200, scrollHeight: 1768 });

    const { result } = renderHook(() => useWindowScroll(ref));

    expect(result.current.y).toBe(0);

    ref.current = element;
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current.y).toBe(200);

    element.remove();
  });

  it('stops listening on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useWindowScroll());

    unmount();

    const removed = remove.mock.calls.map(call => call[0]);

    expect(removed).toEqual(
      expect.arrayContaining(['scroll', 'resize', 'orientationchange']),
    );
  });
});
