import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useClickOutside from './use-click-outside';

const fire = (type: string, target: EventTarget) => {
  target.dispatchEvent(new MouseEvent(type, { bubbles: true }));
};

describe('useClickOutside', () => {
  let inside: HTMLDivElement;
  let outside: HTMLDivElement;
  let insideRef: { current: HTMLDivElement | null };

  beforeEach(() => {
    inside = document.createElement('div');
    outside = document.createElement('div');
    inside.appendChild(document.createElement('span'));
    document.body.append(inside, outside);
    insideRef = { current: inside };
  });

  afterEach(() => {
    inside.remove();
    outside.remove();
    vi.restoreAllMocks();
  });

  it('calls the handler for a pointerdown outside the element', () => {
    const handler = vi.fn();

    renderHook(() => useClickOutside(insideRef, handler));
    fire('pointerdown', outside);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('ignores a pointerdown inside the element or its children', () => {
    const handler = vi.fn();

    renderHook(() => useClickOutside(insideRef, handler));
    fire('pointerdown', inside);
    fire('pointerdown', inside.firstChild as Node);

    expect(handler).not.toHaveBeenCalled();
  });

  it('treats every ref in a list as inside', () => {
    const handler = vi.fn();
    const portal = document.createElement('div');

    document.body.appendChild(portal);

    renderHook(() =>
      useClickOutside([insideRef, { current: portal }, null], handler),
    );
    fire('pointerdown', portal);
    expect(handler).not.toHaveBeenCalled();

    fire('pointerdown', outside);
    expect(handler).toHaveBeenCalledTimes(1);

    portal.remove();
  });

  it('listens to the events given in `events`', () => {
    const handler = vi.fn();

    renderHook(() =>
      useClickOutside(insideRef, handler, { events: ['mousedown'] }),
    );
    fire('pointerdown', outside);
    expect(handler).not.toHaveBeenCalled();

    fire('mousedown', outside);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('calls the handler on Escape only with the escape option', () => {
    const handler = vi.fn();
    const escape = () =>
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    renderHook(() => useClickOutside(insideRef, handler));
    escape();
    expect(handler).not.toHaveBeenCalled();

    renderHook(() => useClickOutside(insideRef, handler, { escape: true }));
    escape();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not listen when disabled', () => {
    const handler = vi.fn();

    renderHook(() => useClickOutside(insideRef, handler, { enabled: false }));
    fire('pointerdown', outside);

    expect(handler).not.toHaveBeenCalled();
  });

  it('calls the handler from the latest render', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ handler }) => useClickOutside(insideRef, handler),
      { initialProps: { handler: first } },
    );

    rerender({ handler: second });
    fire('pointerdown', outside);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('reads the latest refs without re-registering listeners', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const handler = vi.fn();
    const { rerender } = renderHook(
      ({ refs }) => useClickOutside(refs, handler),
      { initialProps: { refs: [insideRef] } },
    );
    const before = add.mock.calls.length;

    rerender({ refs: [{ current: outside }] });
    fire('pointerdown', outside);
    expect(handler).not.toHaveBeenCalled();

    fire('pointerdown', inside);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(add.mock.calls.length).toBe(before);
  });

  it('removes its listeners on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() =>
      useClickOutside(insideRef, handler, { escape: true }),
    );

    unmount();
    fire('pointerdown', outside);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(handler).not.toHaveBeenCalled();
  });
});
