import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import useLocalStorage from './use-local-storage';
import useSessionStorage from './use-session-storage';

describe('useSessionStorage', () => {
  it('reads and writes sessionStorage', () => {
    const { result } = renderHook(() => useSessionStorage('key', 1));

    expect(sessionStorage.getItem('key')).toBe('1');

    act(() => result.current[1](value => value + 1));

    expect(result.current[0]).toBe(2);
    expect(sessionStorage.getItem('key')).toBe('2');
  });

  it('keeps two instances of the same key in sync', () => {
    const first = renderHook(() => useSessionStorage('key', 0));
    const second = renderHook(() => useSessionStorage('key', 0));

    act(() => first.result.current[1](4));

    expect(second.result.current[0]).toBe(4);
  });

  it('keeps the same key separate from localStorage', () => {
    const local = renderHook(() => useLocalStorage('key', 'initial'));
    const session = renderHook(() => useSessionStorage('key', 'initial'));

    act(() => local.result.current[1]('local'));

    expect(local.result.current[0]).toBe('local');
    expect(session.result.current[0]).toBe('initial');
    expect(sessionStorage.getItem('key')).toBe('"initial"');

    act(() => session.result.current[1]('session'));

    expect(local.result.current[0]).toBe('local');
    expect(session.result.current[0]).toBe('session');
  });

  it('ignores a storage event from the other storage area', () => {
    const { result } = renderHook(() => useSessionStorage('key', 0));

    act(() => {
      localStorage.setItem('key', '7');
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'key',
          storageArea: localStorage,
        }),
      );
    });

    expect(result.current[0]).toBe(0);
  });
});
