import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import useBeforeUnload from './use-before-unload';

const dispatchBeforeUnload = () => {
  const event = new Event('beforeunload', { cancelable: true });

  window.dispatchEvent(event);

  return event;
};

const countCalls = (spy: { mock: { calls: unknown[][] } }) =>
  spy.mock.calls.filter(([type]) => type === 'beforeunload').length;

describe('useBeforeUnload', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('attaches no listener while disabled', () => {
    const add = vi.spyOn(window, 'addEventListener');

    renderHook(() => useBeforeUnload(false));

    expect(countCalls(add)).toBe(0);
    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });

  it('prevents the unload while enabled', () => {
    renderHook(() => useBeforeUnload(true));

    const event = dispatchBeforeUnload();

    expect(event.defaultPrevented).toBe(true);
  });

  it('removes the listener when enabled turns false', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { rerender } = renderHook(({ enabled }) => useBeforeUnload(enabled), {
      initialProps: { enabled: true },
    });

    rerender({ enabled: false });

    expect(countCalls(remove)).toBe(1);
    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });

  it('removes the listener on unmount', () => {
    const { unmount } = renderHook(() => useBeforeUnload(true));

    unmount();

    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });
});
