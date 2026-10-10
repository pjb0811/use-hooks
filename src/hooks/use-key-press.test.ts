import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import useKeyPress from './use-key-press';

const press = (
  init: KeyboardEventInit,
  target: EventTarget = window,
): KeyboardEvent => {
  const event = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    ...init,
  });

  target.dispatchEvent(event);

  return event;
};

describe('useKeyPress', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the handler for a plain key', () => {
    const handler = vi.fn();

    renderHook(() => useKeyPress('a', handler));
    press({ key: 'a' });

    expect(handler).toHaveBeenCalledTimes(1);
    press({ key: 'b' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('matches the key case-insensitively', () => {
    const handler = vi.fn();

    renderHook(() => useKeyPress('a', handler));
    press({ key: 'A' });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('requires the modifiers named in the combo', () => {
    const handler = vi.fn();

    renderHook(() => useKeyPress('ctrl+s', handler));
    press({ key: 's' });
    expect(handler).not.toHaveBeenCalled();

    press({ key: 's', ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('requires modifiers that are not named to be absent', () => {
    const undo = vi.fn();
    const redo = vi.fn();

    renderHook(() => {
      useKeyPress('ctrl+z', undo);
      useKeyPress('ctrl+shift+z', redo);
    });
    press({ key: 'z', ctrlKey: true, shiftKey: true });

    expect(undo).not.toHaveBeenCalled();
    expect(redo).toHaveBeenCalledTimes(1);
  });

  it('maps mod to ctrl outside macOS and to meta on macOS', () => {
    const handler = vi.fn();

    renderHook(() => useKeyPress('mod+k', handler));
    press({ key: 'k', ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);

    press({ key: 'k', metaKey: true });
    expect(handler).toHaveBeenCalledTimes(1);

    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Macintosh');
    const macHandler = vi.fn();

    renderHook(() => useKeyPress('mod+k', macHandler));
    press({ key: 'k', metaKey: true });
    expect(macHandler).toHaveBeenCalledTimes(1);
  });

  it('understands the aliases esc and space', () => {
    const esc = vi.fn();
    const space = vi.fn();

    renderHook(() => {
      useKeyPress('esc', esc);
      useKeyPress('space', space);
    });
    press({ key: 'Escape' });
    press({ key: ' ' });

    expect(esc).toHaveBeenCalledTimes(1);
    expect(space).toHaveBeenCalledTimes(1);
  });

  it('accepts several combos', () => {
    const handler = vi.fn();

    renderHook(() => useKeyPress(['a', 'b'], handler));
    press({ key: 'a' });
    press({ key: 'b' });
    press({ key: 'c' });

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('calls preventDefault only when asked to', () => {
    renderHook(() => useKeyPress('a', vi.fn()));
    expect(press({ key: 'a' }).defaultPrevented).toBe(false);

    renderHook(() => useKeyPress('b', vi.fn(), { preventDefault: true }));
    expect(press({ key: 'b' }).defaultPrevented).toBe(true);
  });

  it('ignores keys pressed inside an element that matches `ignore`', () => {
    const handler = vi.fn();
    const editor = document.createElement('div');
    const input = document.createElement('input');

    editor.className = 'editor';
    editor.appendChild(input);
    document.body.appendChild(editor);

    renderHook(() => useKeyPress('a', handler, { ignore: '.editor' }));
    press({ key: 'a' }, input);
    expect(handler).not.toHaveBeenCalled();

    press({ key: 'a' }, document.body);
    expect(handler).toHaveBeenCalledTimes(1);

    editor.remove();
  });

  it('does not listen when disabled', () => {
    const handler = vi.fn();

    renderHook(() => useKeyPress('a', handler, { enabled: false }));
    press({ key: 'a' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('listens on a given target instead of window', () => {
    const handler = vi.fn();
    const element = document.createElement('div');

    renderHook(() => useKeyPress('a', handler, { target: element }));
    press({ key: 'a' });
    expect(handler).not.toHaveBeenCalled();

    press({ key: 'a' }, element);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('calls the handler from the latest render', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ handler }) => useKeyPress('a', handler),
      { initialProps: { handler: first } },
    );

    rerender({ handler: second });
    press({ key: 'a' });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('does not re-register for a new combo array with the same keys', () => {
    const add = vi.spyOn(window, 'addEventListener');
    const { rerender } = renderHook(() => useKeyPress(['a', 'b'], vi.fn()));
    const before = add.mock.calls.filter(c => c[0] === 'keydown').length;

    rerender();

    expect(add.mock.calls.filter(c => c[0] === 'keydown').length).toBe(before);
  });

  it('removes the listener on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useKeyPress('a', handler));

    unmount();
    press({ key: 'a' });

    expect(handler).not.toHaveBeenCalled();
  });
});
