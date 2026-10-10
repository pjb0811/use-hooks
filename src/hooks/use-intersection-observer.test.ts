import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type FakeIntersectionObserver,
  installIntersectionObserver,
  lastOf,
} from '../test-utils/observers';
import useIntersectionObserver from './use-intersection-observer';

const entry = (isIntersecting: boolean) =>
  ({ isIntersecting }) as Partial<IntersectionObserverEntry>;

describe('useIntersectionObserver', () => {
  let Observer: typeof FakeIntersectionObserver;
  let node: HTMLDivElement;

  beforeEach(() => {
    Observer = installIntersectionObserver();
    node = document.createElement('div');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts with no entry and not intersecting', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    expect(result.current[1]).toEqual({ entry: null, isIntersecting: false });
    expect(Observer.instances).toHaveLength(0);
  });

  it('observes the node given to the callback ref', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    act(() => result.current[0](node));

    expect(lastOf(Observer.instances).observed.has(node)).toBe(true);
  });

  it('passes the observer options through', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ threshold: 0.5, rootMargin: '10px' }),
    );

    act(() => result.current[0](node));

    expect(lastOf(Observer.instances).init).toEqual({
      threshold: 0.5,
      rootMargin: '10px',
    });
  });

  it('reports the latest entry and whether it intersects', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    act(() => result.current[0](node));
    act(() => lastOf(Observer.instances).trigger([entry(true)]));
    expect(result.current[1].isIntersecting).toBe(true);

    act(() => lastOf(Observer.instances).trigger([entry(false)]));
    expect(result.current[1].isIntersecting).toBe(false);
    expect(result.current[1].entry).not.toBeNull();
  });

  it('reconnects when the options change', () => {
    const { result, rerender } = renderHook(
      ({ threshold }) => useIntersectionObserver({ threshold }),
      { initialProps: { threshold: 0 } },
    );

    act(() => result.current[0](node));
    const first = lastOf(Observer.instances);

    rerender({ threshold: 1 });

    expect(first.disconnected).toBe(true);
    expect(lastOf(Observer.instances).init).toEqual({ threshold: 1 });
  });

  it('does not reconnect for a new options object with the same values', () => {
    const { result, rerender } = renderHook(() =>
      useIntersectionObserver({ threshold: 0.5 }),
    );

    act(() => result.current[0](node));
    const count = Observer.instances.length;

    rerender();

    expect(Observer.instances).toHaveLength(count);
  });

  it('stops observing for good after the first intersection with freezeOnceVisible', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({ freezeOnceVisible: true }),
    );

    act(() => result.current[0](node));
    const observer = lastOf(Observer.instances);

    act(() => observer.trigger([entry(false)]));
    expect(observer.disconnected).toBe(false);

    act(() => observer.trigger([entry(true)]));
    expect(observer.disconnected).toBe(true);

    const count = Observer.instances.length;

    act(() => result.current[0](document.createElement('div')));
    expect(Observer.instances).toHaveLength(count);
    expect(result.current[1].isIntersecting).toBe(true);
  });

  it('keeps observing after an intersection without freezeOnceVisible', () => {
    const { result } = renderHook(() => useIntersectionObserver());

    act(() => result.current[0](node));
    act(() => lastOf(Observer.instances).trigger([entry(true)]));

    expect(lastOf(Observer.instances).disconnected).toBe(false);
  });

  it('disconnects when the node is released and on unmount', () => {
    const { result, unmount } = renderHook(() => useIntersectionObserver());

    act(() => result.current[0](node));
    const observer = lastOf(Observer.instances);

    act(() => result.current[0](null));
    expect(observer.disconnected).toBe(true);

    act(() => result.current[0](node));
    const second = lastOf(Observer.instances);

    unmount();
    expect(second.disconnected).toBe(true);
  });

  it('does not throw where IntersectionObserver does not exist', () => {
    vi.unstubAllGlobals();

    const { result } = renderHook(() => useIntersectionObserver());

    expect(() => act(() => result.current[0](node))).not.toThrow();
  });
});
