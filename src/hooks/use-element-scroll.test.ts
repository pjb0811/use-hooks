import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type FakeResizeObserver,
  installResizeObserver,
  lastOf,
} from '../test-utils/observers';
import useElementScroll from './use-element-scroll';

const setMetrics = (
  element: HTMLElement,
  metrics: { scrollTop?: number; scrollHeight?: number; clientHeight?: number },
) => {
  Object.entries(metrics).forEach(([key, value]) => {
    Object.defineProperty(element, key, { configurable: true, value });
  });
};

describe('useElementScroll', () => {
  let Observer: typeof FakeResizeObserver;
  let element: HTMLDivElement;

  beforeEach(() => {
    Observer = installResizeObserver();
    element = document.createElement('div');
    setMetrics(element, {
      scrollTop: 0,
      scrollHeight: 1000,
      clientHeight: 200,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('has an initial state before an element is attached', () => {
    const { result } = renderHook(() => useElementScroll());

    expect(result.current).toMatchObject({
      scrollY: 0,
      scrollPercentage: 0,
      isAtTop: true,
      isAtBottom: false,
      element: null,
    });
  });

  it('measures the element once it is attached', () => {
    const { result } = renderHook(() => useElementScroll());

    act(() => result.current.setRef(element));

    expect(result.current).toMatchObject({
      scrollY: 0,
      scrollPercentage: 0,
      isAtTop: true,
      isAtBottom: false,
      scrollableHeight: 800,
      clientHeight: 200,
      scrollHeight: 1000,
      element,
    });
  });

  it('follows the scroll position', () => {
    const { result } = renderHook(() => useElementScroll());

    act(() => result.current.setRef(element));
    act(() => {
      setMetrics(element, { scrollTop: 400 });
      element.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toMatchObject({
      scrollY: 400,
      scrollPercentage: 50,
      isAtTop: false,
      isAtBottom: false,
    });
  });

  it('is at the bottom within the threshold', () => {
    const { result } = renderHook(() => useElementScroll({ threshold: 20 }));

    act(() => result.current.setRef(element));
    act(() => {
      setMetrics(element, { scrollTop: 780 });
      element.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.isAtBottom).toBe(true);

    act(() => {
      setMetrics(element, { scrollTop: 700 });
      element.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.isAtBottom).toBe(false);
  });

  it('is at both ends when the content does not scroll', () => {
    setMetrics(element, { scrollHeight: 200, clientHeight: 200 });

    const { result } = renderHook(() => useElementScroll());

    act(() => result.current.setRef(element));

    expect(result.current).toMatchObject({
      scrollPercentage: 0,
      isAtTop: true,
      isAtBottom: true,
      scrollableHeight: 0,
    });
  });

  it('measures again when the element or a child is resized', () => {
    const child = document.createElement('div');

    element.appendChild(child);

    const { result } = renderHook(() => useElementScroll());

    act(() => result.current.setRef(element));

    const observer = lastOf(Observer.instances);

    expect(observer.observed.has(element)).toBe(true);
    expect(observer.observed.has(child)).toBe(true);

    act(() => {
      setMetrics(element, { scrollHeight: 2000 });
      observer.trigger();
    });

    expect(result.current.scrollableHeight).toBe(1800);
  });

  it('starts watching a child that is added later', async () => {
    const { result } = renderHook(() => useElementScroll());

    act(() => result.current.setRef(element));

    const child = document.createElement('div');

    await act(async () => {
      setMetrics(element, { scrollHeight: 1500 });
      element.appendChild(child);
      await Promise.resolve();
    });

    expect(lastOf(Observer.instances).observed.has(child)).toBe(true);
    expect(result.current.scrollHeight).toBe(1500);
  });

  it('does not re-render when a scroll leaves every value the same', () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;

      return useElementScroll();
    });

    act(() => result.current.setRef(element));

    const before = renders;

    act(() => {
      element.dispatchEvent(new Event('scroll'));
    });

    expect(renders).toBe(before);
  });

  it('stops listening and observing on unmount', () => {
    const { result, unmount } = renderHook(() => useElementScroll());

    act(() => result.current.setRef(element));

    const observer = lastOf(Observer.instances);
    const remove = vi.spyOn(element, 'removeEventListener');

    unmount();

    expect(observer.disconnected).toBe(true);
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('keeps setRef stable across renders', () => {
    const { result, rerender } = renderHook(() => useElementScroll());
    const first = result.current.setRef;

    rerender();

    expect(result.current.setRef).toBe(first);
  });
});
