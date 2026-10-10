import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type FakeResizeObserver,
  installResizeObserver,
  lastOf,
} from '../test-utils/observers';
import useResponsiveSize from './use-responsive-size';

const setWindow = (width: number, height = 800) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: height,
  });
};

const sizeOf = (element: HTMLElement, width: number, height: number) => {
  Object.defineProperty(element, 'offsetWidth', {
    configurable: true,
    value: width,
  });
  Object.defineProperty(element, 'offsetHeight', {
    configurable: true,
    value: height,
  });
};

describe('useResponsiveSize', () => {
  let Observer: typeof FakeResizeObserver;

  beforeEach(() => {
    vi.useFakeTimers();
    Observer = installResizeObserver();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('viewport', () => {
    it('measures the window before the first paint', () => {
      setWindow(900, 700);

      const { result } = renderHook(() =>
        useResponsiveSize({ viewport: true }),
      );

      expect(result.current.size).toEqual({ width: 900, height: 700 });
      expect(result.current.breakpoint.current).toBe('md');
    });

    it.each([
      [639, 'xs'],
      [640, 'sm'],
      [767, 'sm'],
      [768, 'md'],
      [1023, 'md'],
      [1024, 'lg'],
      [1279, 'lg'],
      [1280, 'xl'],
      [1535, 'xl'],
      [1536, '2xl'],
    ])('maps a width of %i to %s', (width, expected) => {
      setWindow(width);

      const { result } = renderHook(() =>
        useResponsiveSize({ viewport: true }),
      );

      expect(result.current.breakpoint.current).toBe(expected);
      expect(result.current.breakpoint[expected as 'xs']).toBe(true);
    });

    it('sets exactly one breakpoint flag', () => {
      setWindow(800);

      const { result } = renderHook(() =>
        useResponsiveSize({ viewport: true }),
      );
      const { current, ...flags } = result.current.breakpoint;

      expect(current).toBe('md');
      expect(Object.values(flags).filter(Boolean)).toHaveLength(1);
    });

    it('updates after a resize once the delay has passed', () => {
      setWindow(500);

      const { result } = renderHook(() =>
        useResponsiveSize({ viewport: true, delay: 200 }),
      );

      act(() => {
        setWindow(1300);
        window.dispatchEvent(new Event('resize'));
      });
      act(() => {
        vi.advanceTimersByTime(199);
      });
      expect(result.current.breakpoint.current).toBe('xs');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current.size.width).toBe(1300);
      expect(result.current.breakpoint.current).toBe('xl');
    });

    it('stops listening on unmount', () => {
      const remove = vi.spyOn(window, 'removeEventListener');
      const { unmount } = renderHook(() =>
        useResponsiveSize({ viewport: true }),
      );

      unmount();

      expect(remove.mock.calls.map(call => call[0])).toContain('resize');
    });
  });

  describe('element', () => {
    it('measures the element given to the ref', () => {
      const element = document.createElement('div');

      sizeOf(element, 700, 300);

      const { result } = renderHook(() => useResponsiveSize<HTMLDivElement>());

      act(() => result.current.ref(element));

      expect(result.current.size).toEqual({ width: 700, height: 300 });
      expect(result.current.breakpoint.current).toBe('sm');
    });

    it('measures the container option instead of the ref', () => {
      const container = document.createElement('div');

      sizeOf(container, 1100, 400);

      const { result } = renderHook(() => useResponsiveSize({ container }));

      expect(result.current.size).toEqual({ width: 1100, height: 400 });
    });

    it('updates after the observed element resizes, a frame and the delay later', () => {
      const element = document.createElement('div');

      sizeOf(element, 700, 300);

      const { result } = renderHook(() =>
        useResponsiveSize<HTMLDivElement>({ delay: 100 }),
      );

      act(() => result.current.ref(element));

      expect(lastOf(Observer.instances).observed.has(element)).toBe(true);

      act(() => {
        sizeOf(element, 1400, 300);
        lastOf(Observer.instances).trigger();
        vi.advanceTimersByTime(16);
      });
      expect(result.current.size.width).toBe(700);

      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current.size.width).toBe(1400);
      expect(result.current.breakpoint.current).toBe('xl');
    });

    it('keeps the same breakpoint object while the breakpoint is unchanged', () => {
      const element = document.createElement('div');

      sizeOf(element, 700, 300);

      const { result } = renderHook(() =>
        useResponsiveSize<HTMLDivElement>({ delay: 10 }),
      );

      act(() => result.current.ref(element));

      const before = result.current.breakpoint;

      act(() => {
        sizeOf(element, 720, 300);
        lastOf(Observer.instances).trigger();
        vi.advanceTimersByTime(40);
      });

      expect(result.current.size.width).toBe(720);
      expect(result.current.breakpoint).toBe(before);
    });

    it('disconnects the observer on unmount', () => {
      const element = document.createElement('div');

      sizeOf(element, 700, 300);

      const { result, unmount } = renderHook(() =>
        useResponsiveSize<HTMLDivElement>(),
      );

      act(() => result.current.ref(element));

      const observer = lastOf(Observer.instances);

      unmount();

      expect(observer.disconnected).toBe(true);
    });

    it('keeps the ref callback stable across renders', () => {
      const { result, rerender } = renderHook(() =>
        useResponsiveSize<HTMLDivElement>(),
      );
      const first = result.current.ref;

      rerender();

      expect(result.current.ref).toBe(first);
    });
  });
});
