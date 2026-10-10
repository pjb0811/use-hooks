import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useScrollToElements from './use-scroll-to-elements';

const rectAt = (top: number) =>
  ({ top, bottom: top + 10, left: 0, right: 10 }) as DOMRect;

describe('useScrollToElements', () => {
  let scrollIntoView: ReturnType<typeof vi.fn>;
  let windowScrollTo: ReturnType<typeof vi.fn>;
  let element: HTMLDivElement;

  beforeEach(() => {
    scrollIntoView = vi.fn();
    windowScrollTo = vi.fn();
    Element.prototype.scrollIntoView =
      scrollIntoView as unknown as typeof Element.prototype.scrollIntoView;
    window.scrollTo = windowScrollTo as unknown as typeof window.scrollTo;
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });

    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
    vi.restoreAllMocks();
  });

  const setup = (
    defaultOptions?: Parameters<typeof useScrollToElements>[0],
  ) => {
    const hook = renderHook(
      (props: Parameters<typeof useScrollToElements>[0]) =>
        useScrollToElements(props),
      { initialProps: defaultOptions },
    );

    act(() => hook.result.current.register('a')(element));

    return hook;
  };

  it('scrolls the registered element into view, smoothly to the start', () => {
    const { result } = setup();

    result.current.scrollTo('a');

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
      inline: 'start',
    });
    expect(scrollIntoView.mock.contexts[0]).toBe(element);
  });

  it('merges default options and per-call options over the built-in ones', () => {
    const { result } = setup({ block: 'center', behavior: 'auto' });

    result.current.scrollTo('a', { behavior: 'instant' });

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'instant',
      block: 'center',
      inline: 'start',
    });
  });

  it('uses the default options of the latest render', () => {
    const { result, rerender } = setup({ block: 'start' });

    rerender({ block: 'end' });
    result.current.scrollTo('a');

    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'end' }),
    );
  });

  it('does nothing for a key that was never registered', () => {
    const { result } = setup();

    result.current.scrollTo('missing');

    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(windowScrollTo).not.toHaveBeenCalled();
  });

  it('forgets an element when its ref is released', () => {
    const { result } = setup();

    act(() => result.current.register('a')(null));
    result.current.scrollTo('a');

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('hands out the same ref callback for a key every time', () => {
    const { result, rerender } = setup();
    const first = result.current.register('a');

    rerender(undefined);

    expect(result.current.register('a')).toBe(first);
    expect(result.current.register('b')).not.toBe(first);
  });

  it('keeps scrollTo stable across renders', () => {
    const { result, rerender } = setup();
    const first = result.current.scrollTo;

    rerender({ block: 'end' });

    expect(result.current.scrollTo).toBe(first);
  });

  describe('with an offset', () => {
    it('scrolls the window to the element minus the offset', () => {
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        value: 100,
      });
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(rectAt(300));

      const { result } = setup();

      result.current.scrollTo('a', { offset: 80 });

      expect(windowScrollTo).toHaveBeenCalledWith({
        top: 320,
        behavior: 'smooth',
      });
      expect(scrollIntoView).not.toHaveBeenCalled();
    });

    it('scrolls the nearest scrollable ancestor instead of the window', () => {
      const scroller = document.createElement('div');
      const scrollerTo = vi.fn();

      scroller.style.overflowY = 'auto';
      Object.defineProperty(scroller, 'scrollHeight', { value: 1000 });
      Object.defineProperty(scroller, 'clientHeight', { value: 200 });
      Object.defineProperty(scroller, 'scrollTop', { value: 50 });
      scroller.scrollTo = scrollerTo as unknown as typeof scroller.scrollTo;
      vi.spyOn(scroller, 'getBoundingClientRect').mockReturnValue(rectAt(100));
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(rectAt(400));
      scroller.appendChild(element);
      document.body.appendChild(scroller);

      const { result } = setup();

      result.current.scrollTo('a', { offset: 20, behavior: 'auto' });

      expect(scrollerTo).toHaveBeenCalledWith({ top: 330, behavior: 'auto' });
      expect(windowScrollTo).not.toHaveBeenCalled();

      scroller.remove();
    });

    it('scrolls an explicit container', () => {
      const container = document.createElement('div');
      const containerTo = vi.fn();

      Object.defineProperty(container, 'scrollTop', { value: 0 });
      container.scrollTo = containerTo as unknown as typeof container.scrollTo;
      vi.spyOn(container, 'getBoundingClientRect').mockReturnValue(rectAt(50));
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(rectAt(250));

      const { result } = setup();

      result.current.scrollTo('a', { offset: 10, container });

      expect(containerTo).toHaveBeenCalledWith({
        top: 190,
        behavior: 'smooth',
      });
    });

    it('treats an offset of 0 as an offset', () => {
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(rectAt(300));

      const { result } = setup();

      result.current.scrollTo('a', { offset: 0 });

      expect(windowScrollTo).toHaveBeenCalledWith({
        top: 300,
        behavior: 'smooth',
      });
      expect(scrollIntoView).not.toHaveBeenCalled();
    });
  });
});
