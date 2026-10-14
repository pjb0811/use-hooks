import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useHash from './use-hash';

describe('useHash', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads an empty string when there is no hash', () => {
    const { result } = renderHook(() => useHash());

    expect(result.current[0]).toBe('');
  });

  it('reads the initial hash without #', () => {
    window.history.replaceState(null, '', '#tab-a');

    const { result } = renderHook(() => useHash());

    expect(result.current[0]).toBe('tab-a');
  });

  it('follows a hash changed from outside', async () => {
    const { result } = renderHook(() => useHash());

    act(() => {
      window.location.hash = 'outside';
    });

    await waitFor(() => expect(result.current[0]).toBe('outside'));
  });

  it('updates every component using it when setHash is called', async () => {
    const first = renderHook(() => useHash());
    const second = renderHook(() => useHash());

    act(() => first.result.current[1]('shared'));

    await waitFor(() => {
      expect(first.result.current[0]).toBe('shared');
      expect(second.result.current[0]).toBe('shared');
    });
  });

  it('replaces the history entry with replace: true', () => {
    const { result } = renderHook(() => useHash());
    const length = window.history.length;

    act(() => result.current[1]('replaced', { replace: true }));

    expect(result.current[0]).toBe('replaced');
    expect(window.location.hash).toBe('#replaced');
    expect(window.history.length).toBe(length);
  });

  it('decodes an encoded hash and returns a malformed one as is', () => {
    const { result } = renderHook(() => useHash());

    act(() => result.current[1]('a b/ü', { replace: true }));
    expect(result.current[0]).toBe('a b/ü');

    act(() => result.current[1]('%E0%A4%A', { replace: true }));
    expect(result.current[0]).toBe('%E0%A4%A');
  });

  it.each([false, true])(
    'clears the hash without leaving a # (replace: %s)',
    replace => {
      const first = renderHook(() => useHash());
      const second = renderHook(() => useHash());

      act(() => first.result.current[1]('x', { replace: true }));
      act(() => first.result.current[1]('', { replace }));

      expect(window.location.href).toBe(`${window.location.origin}/`);
      expect(first.result.current[0]).toBe('');
      expect(second.result.current[0]).toBe('');
    },
  );

  it('adds a history entry when clearing without replace', () => {
    const { result } = renderHook(() => useHash());

    act(() => result.current[1]('x', { replace: true }));
    const length = window.history.length;

    act(() => result.current[1](''));

    expect(window.history.length).toBe(length + 1);
  });

  it('does not add a history entry when clearing an empty hash', () => {
    const { result } = renderHook(() => useHash());
    const length = window.history.length;

    act(() => result.current[1](''));

    expect(window.history.length).toBe(length);
  });

  it('keeps setHash identity across rerenders', () => {
    const { result, rerender } = renderHook(() => useHash());
    const setHash = result.current[1];

    rerender();

    expect(result.current[1]).toBe(setHash);
  });

  it('removes the hashchange listener on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useHash());

    unmount();

    expect(remove).toHaveBeenCalledWith('hashchange', expect.any(Function));
  });
});
