import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useCopyToClipboard from './use-copy-to-clipboard';

const setClipboard = (writeText: ((text: string) => Promise<void>) | null) => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  });
};

describe('useCopyToClipboard', () => {
  let writeText: ReturnType<typeof vi.fn<(text: string) => Promise<void>>>;

  beforeEach(() => {
    vi.useFakeTimers();
    writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
    setClipboard(writeText);
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(navigator, 'clipboard');
  });

  const copyWith = async (
    result: { current: ReturnType<typeof useCopyToClipboard> },
    text = 'hello',
  ) => {
    let ok: boolean | undefined;

    await act(async () => {
      ok = await result.current.copy(text);
    });

    return ok;
  };

  it('starts not copied and without an error', () => {
    const { result } = renderHook(() => useCopyToClipboard());

    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('writes the text, sets copied and resolves to true', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    const ok = await copyWith(result, 'pnpm add x');

    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith('pnpm add x');
    expect(result.current.copied).toBe(true);
  });

  it('goes back to not copied after resetDelay', async () => {
    const { result } = renderHook(() =>
      useCopyToClipboard({ resetDelay: 500 }),
    );

    await copyWith(result);
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.copied).toBe(false);
  });

  it('uses a reset delay of 1500ms by default', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await copyWith(result);
    act(() => {
      vi.advanceTimersByTime(1499);
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.copied).toBe(false);
  });

  it('restarts the timer on a second copy', async () => {
    const { result } = renderHook(() =>
      useCopyToClipboard({ resetDelay: 1000 }),
    );

    await copyWith(result);
    act(() => {
      vi.advanceTimersByTime(700);
    });
    await copyWith(result);
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.copied).toBe(false);
  });

  it('keeps copied until the next copy with resetDelay: null', async () => {
    const { result } = renderHook(() =>
      useCopyToClipboard({ resetDelay: null }),
    );

    await copyWith(result);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(result.current.copied).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('clears the timer on unmount', async () => {
    const { result, unmount } = renderHook(() => useCopyToClipboard());

    await copyWith(result);
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it('sets error, leaves copied false and resolves to false when writeText rejects', async () => {
    const failure = new Error('denied');

    writeText.mockRejectedValue(failure);

    const { result } = renderHook(() => useCopyToClipboard());
    const ok = await copyWith(result);

    expect(ok).toBe(false);
    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBe(failure);
  });

  it('wraps a rejection that is not an Error', async () => {
    writeText.mockRejectedValue('nope');

    const { result } = renderHook(() => useCopyToClipboard());

    await copyWith(result);

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('nope');
  });

  it('reports an error when the Clipboard API is missing', async () => {
    setClipboard(null);

    const { result } = renderHook(() => useCopyToClipboard());
    const ok = await copyWith(result);

    expect(ok).toBe(false);
    expect(result.current.error?.message).toBe(
      'The Clipboard API is not available.',
    );
  });

  it('clears the error on the next successful copy', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));

    const { result } = renderHook(() => useCopyToClipboard());

    await copyWith(result);
    expect(result.current.error).not.toBeNull();

    await copyWith(result);
    expect(result.current.error).toBeNull();
    expect(result.current.copied).toBe(true);
  });

  it('stops showing copied when a later copy fails', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await copyWith(result);
    writeText.mockRejectedValueOnce(new Error('denied'));
    await copyWith(result);

    expect(result.current.copied).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps copy stable across renders', () => {
    const { result, rerender } = renderHook(() => useCopyToClipboard());
    const first = result.current.copy;

    rerender();

    expect(result.current.copy).toBe(first);
  });
});
