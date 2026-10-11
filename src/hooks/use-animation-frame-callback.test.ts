import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useAnimationFrameCallback from './use-animation-frame-callback';

const nextFrame = () =>
  act(() => {
    vi.advanceTimersByTime(16);
  });

describe('useAnimationFrameCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs the callback on the next frame, not right away', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useAnimationFrameCallback(callback));

    result.current[0]();
    expect(callback).not.toHaveBeenCalled();

    nextFrame();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('runs once per frame with the last arguments', () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useAnimationFrameCallback((value: number, label: string) =>
        callback(value, label),
      ),
    );

    result.current[0](1, 'a');
    result.current[0](2, 'b');
    result.current[0](3, 'c');
    nextFrame();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(3, 'c');
  });

  it('requests only one frame for several calls', () => {
    const request = vi.spyOn(window, 'requestAnimationFrame');
    const { result } = renderHook(() => useAnimationFrameCallback(vi.fn()));

    result.current[0]();
    result.current[0]();
    result.current[0]();

    expect(request).toHaveBeenCalledTimes(1);

    request.mockRestore();
  });

  it('schedules again after a frame has run', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useAnimationFrameCallback(callback));

    result.current[0]();
    nextFrame();
    result.current[0]();
    nextFrame();

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('lets the callback schedule the next frame, until it stops', () => {
    let runs = 0;
    const { result } = renderHook(() => {
      const controls = useAnimationFrameCallback(() => {
        runs += 1;

        if (runs < 3) {
          controls[0]();
        }
      });

      return controls;
    });

    result.current[0]();
    nextFrame();
    nextFrame();
    nextFrame();
    nextFrame();

    expect(runs).toBe(3);
  });

  it('drops the pending frame with cancel', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useAnimationFrameCallback(callback));

    result.current[0]();
    result.current[1]();
    nextFrame();

    expect(callback).not.toHaveBeenCalled();
  });

  it('does nothing when cancel is called with nothing pending', () => {
    const { result } = renderHook(() => useAnimationFrameCallback(vi.fn()));

    expect(() => result.current[1]()).not.toThrow();
  });

  it('can schedule again after a cancel', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useAnimationFrameCallback(callback));

    result.current[0]();
    result.current[1]();
    result.current[0]();
    nextFrame();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancels the pending frame on unmount', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() =>
      useAnimationFrameCallback(callback),
    );

    result.current[0]();
    unmount();
    nextFrame();

    expect(callback).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps schedule and cancel the same across renders', () => {
    const { result, rerender } = renderHook(() =>
      useAnimationFrameCallback(vi.fn()),
    );
    const [schedule, cancel] = result.current;

    rerender();

    expect(result.current[0]).toBe(schedule);
    expect(result.current[1]).toBe(cancel);
  });

  it('calls the callback from the latest render', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(
      ({ callback }) => useAnimationFrameCallback(callback),
      { initialProps: { callback: first } },
    );

    result.current[0]();
    rerender({ callback: second });
    nextFrame();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  describe('with a custom window', () => {
    const fakeWindow = () => {
      let queued: FrameRequestCallback | null = null;
      const view = {
        requestAnimationFrame: vi.fn((frame: FrameRequestCallback) => {
          queued = frame;

          return 7;
        }),
        cancelAnimationFrame: vi.fn(),
      };

      return {
        view: view as unknown as Window,
        spies: view,
        flush: () => queued?.(0),
      };
    };

    it("uses that window's requestAnimationFrame", () => {
      const callback = vi.fn();
      const { view, spies, flush } = fakeWindow();
      const globalRequest = vi.spyOn(window, 'requestAnimationFrame');
      const { result } = renderHook(() =>
        useAnimationFrameCallback(callback, { window: view }),
      );

      result.current[0]();

      expect(spies.requestAnimationFrame).toHaveBeenCalledTimes(1);
      expect(globalRequest).not.toHaveBeenCalled();

      flush();
      expect(callback).toHaveBeenCalledTimes(1);

      globalRequest.mockRestore();
    });

    it('cancels on the window that scheduled the frame', () => {
      const { view, spies } = fakeWindow();
      const { result } = renderHook(() =>
        useAnimationFrameCallback(vi.fn(), { window: view }),
      );

      result.current[0]();
      result.current[1]();

      expect(spies.cancelAnimationFrame).toHaveBeenCalledWith(7);
    });

    it('cancels on the old window if the option changes while a frame is pending', () => {
      const first = fakeWindow();
      const second = fakeWindow();
      const { result, rerender } = renderHook(
        ({ view }) => useAnimationFrameCallback(vi.fn(), { window: view }),
        { initialProps: { view: first.view } },
      );

      result.current[0]();
      rerender({ view: second.view });
      result.current[1]();

      expect(first.spies.cancelAnimationFrame).toHaveBeenCalledWith(7);
      expect(second.spies.cancelAnimationFrame).not.toHaveBeenCalled();
    });
  });
});
