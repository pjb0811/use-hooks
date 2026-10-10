import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import useFileToDataUrl from './use-file-to-data-url';

describe('useFileToDataUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads a file as a data URL', async () => {
    const { result } = renderHook(() => useFileToDataUrl());
    const file = new File(['hi'], 'a.txt', { type: 'text/plain' });

    await expect(result.current(file)).resolves.toBe(
      'data:text/plain;base64,aGk=',
    );
  });

  it('keeps the same function across renders', () => {
    const { result, rerender } = renderHook(() => useFileToDataUrl());
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });

  it('rejects with the reader error', async () => {
    const readerError = new Error('boom');

    class FailingReader {
      error = readerError;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      result: string | ArrayBuffer | null = null;

      readAsDataURL() {
        queueMicrotask(() => this.onerror?.());
      }
    }

    vi.stubGlobal('FileReader', FailingReader);

    const { result } = renderHook(() => useFileToDataUrl());

    await expect(result.current(new File([], 'a.txt'))).rejects.toBe(
      readerError,
    );
  });

  it('rejects when the result is not a string', async () => {
    class OddReader {
      error = null;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      result: string | ArrayBuffer | null = new ArrayBuffer(1);

      readAsDataURL() {
        queueMicrotask(() => this.onload?.());
      }
    }

    vi.stubGlobal('FileReader', OddReader);

    const { result } = renderHook(() => useFileToDataUrl());

    await expect(result.current(new File([], 'a.txt'))).rejects.toThrow(
      'Failed to read file as a data URL.',
    );
  });
});
