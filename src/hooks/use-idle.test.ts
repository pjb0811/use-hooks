import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useIdle from './use-idle';

const fire = (type: string) => {
  act(() => {
    window.dispatchEvent(new Event(type));
  });
};

describe('useIdle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('becomes idle after the timeout', () => {
    const { result } = renderHook(() => useIdle(1000));

    expect(result.current).toBe(false);

    act(() => vi.advanceTimersByTime(999));
    expect(result.current).toBe(false);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(true);
  });

  it('restarts the timer on activity', () => {
    const { result } = renderHook(() => useIdle(1000));

    act(() => vi.advanceTimersByTime(800));
    fire('pointermove');
    act(() => vi.advanceTimersByTime(800));

    expect(result.current).toBe(false);

    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe(true);
  });

  it('comes back from idle on activity', () => {
    const { result } = renderHook(() => useIdle(1000));

    act(() => vi.advanceTimersByTime(1000));
    fire('keydown');

    expect(result.current).toBe(false);
  });

  it('counts the page becoming visible as activity', () => {
    const { result } = renderHook(() => useIdle(1000));

    act(() => vi.advanceTimersByTime(1000));
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current).toBe(false);
  });

  it('does not render again on activity while already active', () => {
    let renders = 0;
    renderHook(() => {
      renders += 1;
      return useIdle(1000);
    });
    const initial = renders;

    fire('pointermove');
    fire('pointermove');
    fire('wheel');

    expect(renders).toBe(initial);
  });

  it('restarts the timer when the timeout changes', () => {
    const { result, rerender } = renderHook(({ timeout }) => useIdle(timeout), {
      initialProps: { timeout: 1000 },
    });

    act(() => vi.advanceTimersByTime(800));
    rerender({ timeout: 500 });
    act(() => vi.advanceTimersByTime(499));
    expect(result.current).toBe(false);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(true);
  });

  it('starts idle with initialState: true', () => {
    const { result } = renderHook(() => useIdle(1000, { initialState: true }));

    expect(result.current).toBe(true);

    fire('pointerdown');
    expect(result.current).toBe(false);
  });

  it('listens only to custom events', () => {
    const { result } = renderHook(() => useIdle(1000, { events: ['keydown'] }));

    act(() => vi.advanceTimersByTime(1000));
    fire('pointermove');
    expect(result.current).toBe(true);

    fire('keydown');
    expect(result.current).toBe(false);
  });

  it('does not re-add listeners for an inline events array', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const { rerender } = renderHook(() =>
      useIdle(1000, { events: ['keydown'] }),
    );
    const calls = add.mock.calls.length;

    rerender();

    expect(add.mock.calls.length).toBe(calls);
  });

  it('removes listeners and the timer on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useIdle(1000));

    unmount();

    expect(remove).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });
});
