import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useBodyScrollLock from './use-body-scroll-lock';

const setViewport = ({
  scrollY = 0,
  innerWidth = 1024,
  clientWidth = 1024,
}: {
  scrollY?: number;
  innerWidth?: number;
  clientWidth?: number;
} = {}) => {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value: scrollY,
  });
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: innerWidth,
  });
  Object.defineProperty(document.documentElement, 'clientWidth', {
    configurable: true,
    value: clientWidth,
  });
};

describe('useBodyScrollLock', () => {
  let scrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollTo = vi.fn();
    window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
    setViewport();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fixes the page in place while locked and restores it on unmount', () => {
    document.body.style.paddingRight = '4px';

    const { unmount } = renderHook(() => useBodyScrollLock());

    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.width).toBe('100%');

    unmount();

    expect(document.documentElement.style.overflow).toBe('');
    expect(document.body.style.position).toBe('');
    expect(document.body.style.width).toBe('');
    expect(document.body.style.paddingRight).toBe('4px');

    document.body.style.paddingRight = '';
  });

  it('keeps the scroll position: pins the body at -scrollY, then scrolls back', () => {
    setViewport({ scrollY: 120 });

    const { unmount } = renderHook(() => useBodyScrollLock());

    expect(document.body.style.top).toBe('-120px');

    unmount();

    expect(document.body.style.top).toBe('');
    expect(scrollTo).toHaveBeenCalledWith(0, 120);
  });

  it('adds the scrollbar width to the body padding while locked', () => {
    setViewport({ innerWidth: 1024, clientWidth: 1009 });
    document.body.style.paddingRight = '';

    const { unmount } = renderHook(() => useBodyScrollLock());

    expect(document.body.style.paddingRight).toBe('15px');

    unmount();
    expect(document.body.style.paddingRight).toBe('');
  });

  it('does nothing when disabled', () => {
    renderHook(() => useBodyScrollLock(false));

    expect(document.body.style.position).toBe('');
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('locks and unlocks as `enabled` changes', () => {
    const { rerender } = renderHook(
      ({ enabled }) => useBodyScrollLock(enabled),
      { initialProps: { enabled: false } },
    );

    rerender({ enabled: true });
    expect(document.body.style.position).toBe('fixed');

    rerender({ enabled: false });
    expect(document.body.style.position).toBe('');
  });

  it('stays locked until the last of several locks is released', () => {
    const first = renderHook(() => useBodyScrollLock());
    const second = renderHook(() => useBodyScrollLock());

    first.unmount();
    expect(document.body.style.position).toBe('fixed');

    second.unmount();
    expect(document.body.style.position).toBe('');
  });

  describe('on iOS', () => {
    beforeEach(() => {
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('iPhone');
    });

    it('blocks a touchmove that starts on the body but not one inside content', () => {
      const child = document.createElement('div');

      document.body.appendChild(child);

      const { unmount } = renderHook(() => useBodyScrollLock());
      const onBody = new Event('touchmove', {
        bubbles: true,
        cancelable: true,
      });
      const onChild = new Event('touchmove', {
        bubbles: true,
        cancelable: true,
      });

      document.body.dispatchEvent(onBody);
      child.dispatchEvent(onChild);

      expect(onBody.defaultPrevented).toBe(true);
      expect(onChild.defaultPrevented).toBe(false);

      unmount();
      child.remove();
    });

    it('stops blocking touchmove after unlock', () => {
      const { unmount } = renderHook(() => useBodyScrollLock());

      unmount();

      const event = new Event('touchmove', { bubbles: true, cancelable: true });

      document.body.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });
  });
});
