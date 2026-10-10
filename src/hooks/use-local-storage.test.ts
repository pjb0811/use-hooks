import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import useLocalStorage from './use-local-storage';

describe('useLocalStorage', () => {
  it('returns the initial value and seeds the key when it is unset', () => {
    const { result } = renderHook(() => useLocalStorage('key', 1));

    expect(result.current[0]).toBe(1);
    expect(localStorage.getItem('key')).toBe('1');
  });

  it('reads a value that is already stored', () => {
    localStorage.setItem('key', JSON.stringify({ a: 2 }));

    const { result } = renderHook(() => useLocalStorage('key', { a: 1 }));

    expect(result.current[0]).toEqual({ a: 2 });
  });

  it('writes a value and a functional update to storage', () => {
    const { result } = renderHook(() => useLocalStorage('key', 1));

    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);
    expect(localStorage.getItem('key')).toBe('5');

    act(() => result.current[1](value => value + 1));
    expect(result.current[0]).toBe(6);
    expect(localStorage.getItem('key')).toBe('6');
  });

  it('keeps two instances of the same key in sync', () => {
    const first = renderHook(() => useLocalStorage('key', 0));
    const second = renderHook(() => useLocalStorage('key', 0));

    act(() => first.result.current[1](3));

    expect(second.result.current[0]).toBe(3);
  });

  it('falls back to the initial value when the stored string is not valid JSON', () => {
    localStorage.setItem('key', '{not json');

    const { result } = renderHook(() => useLocalStorage('key', 'fallback'));

    expect(result.current[0]).toBe('fallback');
  });

  it('updates when another document changes the key', () => {
    const { result } = renderHook(() => useLocalStorage('key', 0));

    act(() => {
      localStorage.setItem('key', '9');
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'key',
          storageArea: localStorage,
        }),
      );
    });

    expect(result.current[0]).toBe(9);
  });

  it('logs and keeps the value when writing to storage fails', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('quota');
      });
    const { result } = renderHook(() => useLocalStorage('key', 1));

    act(() => result.current[1](2));

    expect(result.current[0]).toBe(1);
    expect(error).toHaveBeenCalled();

    setItem.mockRestore();
    error.mockRestore();
  });
});
