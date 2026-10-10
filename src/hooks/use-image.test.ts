import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useImage from './use-image';

// jsdom never loads images, so `Image` is replaced with a class that records
// each instance and lets a test finish its load or error by hand.
class FakeImage {
  static instances: FakeImage[] = [];

  src = '';
  naturalWidth = 0;
  naturalHeight = 0;
  onload: (() => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;

  constructor() {
    FakeImage.instances.push(this);
  }

  load(width: number, height: number) {
    this.naturalWidth = width;
    this.naturalHeight = height;
    this.onload?.();
  }

  fail() {
    this.onerror?.(new Event('error'));
  }
}

const last = () => FakeImage.instances[FakeImage.instances.length - 1]!;

describe('useImage', () => {
  beforeEach(() => {
    FakeImage.instances = [];
    vi.stubGlobal('Image', FakeImage);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('starts loading the given src', () => {
    const { result } = renderHook(() => useImage('/a.png'));

    expect(result.current.loading).toBe(true);
    expect(result.current.loaded).toBe(false);
    expect(last().src).toBe('/a.png');
  });

  it('reports the natural size once the image has loaded', () => {
    const { result } = renderHook(() => useImage('/a.png'));

    act(() => last().load(300, 200));

    expect(result.current).toMatchObject({
      loading: false,
      loaded: true,
      error: null,
      naturalSize: { width: 300, height: 200 },
    });
  });

  it('reports an error when loading fails', () => {
    const { result } = renderHook(() => useImage('/a.png'));

    act(() => last().fail());

    expect(result.current.loading).toBe(false);
    expect(result.current.loaded).toBe(false);
    expect(result.current.error?.message).toBe('Failed to load image: /a.png');
  });

  it('does nothing for an empty src', () => {
    const { result } = renderHook(() => useImage(''));

    expect(result.current.loading).toBe(false);
    expect(FakeImage.instances).toHaveLength(0);
  });

  it('loads again for a new src and clears the old size', () => {
    const { result, rerender } = renderHook(({ src }) => useImage(src), {
      initialProps: { src: '/a.png' },
    });

    act(() => last().load(300, 200));
    rerender({ src: '/b.png' });

    expect(result.current.loading).toBe(true);
    expect(result.current.naturalSize).toBeNull();
    expect(last().src).toBe('/b.png');
  });

  it('retries after a failure up to retryCount times', () => {
    const { result } = renderHook(() =>
      useImage('/a.png', { retryCount: 2, retryDelay: 500 }),
    );

    act(() => last().fail());
    expect(FakeImage.instances).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(FakeImage.instances).toHaveLength(2);
    expect(result.current.attemptCount).toBe(1);

    act(() => last().fail());
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(FakeImage.instances).toHaveLength(3);
    expect(result.current.attemptCount).toBe(2);

    act(() => last().fail());
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(FakeImage.instances).toHaveLength(3);
  });

  it('does not retry by default', () => {
    renderHook(() => useImage('/a.png'));

    act(() => last().fail());
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(FakeImage.instances).toHaveLength(1);
  });

  it('starts over with retry()', () => {
    const { result } = renderHook(() => useImage('/a.png'));

    act(() => last().fail());
    act(() => result.current.retry());

    expect(FakeImage.instances).toHaveLength(2);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.attemptCount).toBe(0);
  });

  it('ignores a result that arrives after unmount', () => {
    const { unmount } = renderHook(() => useImage('/a.png'));
    const image = last();

    unmount();

    expect(() => image.load(1, 1)).not.toThrow();
  });

  it('ignores the old image when src changes before it finishes', () => {
    const { result, rerender } = renderHook(({ src }) => useImage(src), {
      initialProps: { src: '/a.png' },
    });
    const first = last();

    rerender({ src: '/b.png' });
    act(() => first.load(10, 10));

    expect(result.current.loaded).toBe(false);
    expect(result.current.naturalSize).toBeNull();
  });
});
