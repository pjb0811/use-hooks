import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useDebouncedCallback from './use-debounced-callback';

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('auto-invoke on deps', () => {
    it('calls the callback right away on the first render by default', () => {
      const callback = vi.fn();

      renderHook(() => useDebouncedCallback(callback, { delay: 100 }, [1]));

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('waits for the delay on the first render with leading: false', () => {
      const callback = vi.fn();

      renderHook(() =>
        useDebouncedCallback(callback, { delay: 100, leading: false }, [1]),
      );
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('calls the callback once after deps stop changing', () => {
      const callback = vi.fn();
      const { rerender } = renderHook(
        ({ dep }) => useDebouncedCallback(callback, { delay: 100 }, [dep]),
        { initialProps: { dep: 1 } },
      );

      rerender({ dep: 2 });
      vi.advanceTimersByTime(60);
      rerender({ dep: 3 });
      vi.advanceTimersByTime(99);
      expect(callback).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('does nothing on a rerender where deps did not change', () => {
      const callback = vi.fn();
      const { rerender } = renderHook(() =>
        useDebouncedCallback(callback, { delay: 100 }, [1]),
      );

      rerender();
      vi.advanceTimersByTime(1000);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('never calls the callback on its own with autoInvoke: false', () => {
      const callback = vi.fn();
      const { rerender } = renderHook(
        ({ dep }) =>
          useDebouncedCallback(callback, { delay: 100, autoInvoke: false }, [
            dep,
          ]),
        { initialProps: { dep: 1 } },
      );

      rerender({ dep: 2 });
      vi.advanceTimersByTime(1000);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('returned function', () => {
    it('debounces manual calls', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebouncedCallback(callback, { delay: 100, autoInvoke: false }),
      );

      result.current();
      vi.advanceTimersByTime(60);
      result.current();
      vi.advanceTimersByTime(99);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('keeps the same identity across renders', () => {
      const { result, rerender } = renderHook(() =>
        useDebouncedCallback(vi.fn(), { delay: 100, autoInvoke: false }),
      );
      const first = result.current;

      rerender();

      expect(result.current).toBe(first);
    });

    it('calls the latest callback and reads the latest delay', () => {
      const first = vi.fn();
      const second = vi.fn();
      const { result, rerender } = renderHook(
        ({ callback, delay }) =>
          useDebouncedCallback(callback, { delay, autoInvoke: false }),
        { initialProps: { callback: first, delay: 100 } },
      );

      rerender({ callback: second, delay: 300 });
      result.current();
      vi.advanceTimersByTime(299);
      expect(second).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
    });

    it('flush runs the waiting call now, and only once', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebouncedCallback(callback, { delay: 100, autoInvoke: false }),
      );

      result.current();
      result.current.flush();
      expect(callback).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('cancel drops the waiting call', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebouncedCallback(callback, { delay: 100, autoInvoke: false }),
      );

      result.current();
      result.current.cancel();
      vi.advanceTimersByTime(1000);

      expect(callback).not.toHaveBeenCalled();
    });

    it('flush and cancel do nothing when no call is waiting', () => {
      const callback = vi.fn();
      const { result } = renderHook(() =>
        useDebouncedCallback(callback, { delay: 100, autoInvoke: false }),
      );

      result.current.flush();
      result.current.cancel();

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('unmount', () => {
    it('drops a waiting call by default', () => {
      const callback = vi.fn();
      const { result, unmount } = renderHook(() =>
        useDebouncedCallback(callback, { delay: 100, autoInvoke: false }),
      );

      result.current();
      unmount();
      vi.advanceTimersByTime(1000);

      expect(callback).not.toHaveBeenCalled();
    });

    it('runs a waiting call with flushOnUnmount', () => {
      const callback = vi.fn();
      const { result, unmount } = renderHook(() =>
        useDebouncedCallback(callback, {
          delay: 100,
          autoInvoke: false,
          flushOnUnmount: true,
        }),
      );

      result.current();
      unmount();

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
