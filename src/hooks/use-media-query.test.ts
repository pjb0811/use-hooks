import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { installMatchMedia } from '../test-utils/match-media';
import useMediaQuery from './use-media-query';

describe('useMediaQuery', () => {
  let media: ReturnType<typeof installMatchMedia>;

  afterEach(() => {
    media?.uninstall();
  });

  it('returns whether the query matches', () => {
    media = installMatchMedia({ '(min-width: 768px)': true });

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(true);
  });

  it('updates when the query result changes', () => {
    media = installMatchMedia({ '(min-width: 768px)': false });
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    act(() => media.set('(min-width: 768px)', true));
    expect(result.current).toBe(true);

    act(() => media.set('(min-width: 768px)', false));
    expect(result.current).toBe(false);
  });

  it('follows a new query', () => {
    media = installMatchMedia({ a: true, b: false });
    const { result, rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      { initialProps: { query: 'a' } },
    );

    expect(result.current).toBe(true);

    rerender({ query: 'b' });
    expect(result.current).toBe(false);
  });

  it('returns defaultValue when matchMedia is not available', () => {
    const { result } = renderHook(() =>
      useMediaQuery('(min-width: 768px)', { defaultValue: true }),
    );

    expect(result.current).toBe(true);
  });

  it('returns false without matchMedia and without a defaultValue', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);
  });

  it('removes its listener on unmount', () => {
    media = installMatchMedia({ a: true });
    const { unmount } = renderHook(() => useMediaQuery('a'));

    expect(media.listenerCount('a')).toBe(1);

    unmount();
    expect(media.listenerCount('a')).toBe(0);
  });

  it('evaluates the query against the window of the target element', () => {
    media = installMatchMedia({ a: false });
    const frame = document.createElement('iframe');

    document.body.appendChild(frame);

    const frameWindow = frame.contentWindow as Window;
    const frameMedia = installMatchMedia({ a: true }, frameWindow);
    const element = frame.contentDocument?.createElement('div') as HTMLElement;

    frame.contentDocument?.body.appendChild(element);

    const { result } = renderHook(() =>
      useMediaQuery('a', { target: { current: element } }),
    );

    expect(result.current).toBe(true);
    expect(frameMedia.matchMedia).toHaveBeenCalledWith('a');

    frameMedia.uninstall();
    frame.remove();
  });
});
