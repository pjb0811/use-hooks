import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useFullscreen from './use-fullscreen';

// jsdom has no Fullscreen API, so `document.fullscreenElement`,
// `document.fullscreenEnabled`, `requestFullscreen` and `exitFullscreen` are
// stubbed to behave like a browser: a request changes the full-screen
// element and fires `fullscreenchange` on the document.
let fullscreenElement: Element | null = null;
let fullscreenEnabled = true;

const setFullscreenElement = (next: Element | null) => {
  fullscreenElement = next;
  document.dispatchEvent(new Event('fullscreenchange'));
};

const requestFullscreen = vi.fn(async function (this: Element) {
  setFullscreenElement(this);
});
const exitFullscreen = vi.fn(async () => {
  setFullscreenElement(null);
});

const setup = () => {
  const element = document.createElement('div');
  const hook = renderHook(() => useFullscreen<HTMLDivElement>());

  act(() => hook.result.current.ref(element));

  return { element, ...hook };
};

describe('useFullscreen', () => {
  beforeEach(() => {
    fullscreenElement = null;
    fullscreenEnabled = true;
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      get: () => fullscreenElement,
    });
    Object.defineProperty(document, 'fullscreenEnabled', {
      configurable: true,
      get: () => fullscreenEnabled,
    });
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: exitFullscreen,
    });
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
      configurable: true,
      value: requestFullscreen,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    Reflect.deleteProperty(document, 'fullscreenElement');
    Reflect.deleteProperty(document, 'fullscreenEnabled');
    Reflect.deleteProperty(document, 'exitFullscreen');
    Reflect.deleteProperty(HTMLElement.prototype, 'requestFullscreen');
  });

  it('starts out of full screen', () => {
    const { result } = setup();

    expect(result.current.isFullscreen).toBe(false);
    expect(result.current.isSupported).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('enters and exits full screen', async () => {
    const { element, result } = setup();

    await act(() => result.current.enter());

    expect(requestFullscreen).toHaveBeenCalledTimes(1);
    expect(requestFullscreen.mock.contexts[0]).toBe(element);
    expect(result.current.isFullscreen).toBe(true);

    await act(() => result.current.exit());

    expect(exitFullscreen).toHaveBeenCalledTimes(1);
    expect(result.current.isFullscreen).toBe(false);
  });

  it('toggles between the two', async () => {
    const { result } = setup();

    await act(() => result.current.toggle());
    expect(result.current.isFullscreen).toBe(true);

    await act(() => result.current.toggle());
    expect(result.current.isFullscreen).toBe(false);
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
    expect(exitFullscreen).toHaveBeenCalledTimes(1);
  });

  it('follows fullscreenchange when the user leaves with Esc', async () => {
    const { result } = setup();

    await act(() => result.current.enter());
    act(() => setFullscreenElement(null));

    expect(result.current.isFullscreen).toBe(false);
  });

  it('is not full screen while another element is', async () => {
    const { result } = setup();
    const other = document.createElement('section');

    await act(() => result.current.enter());
    act(() => setFullscreenElement(other));

    expect(result.current.isFullscreen).toBe(false);
  });

  it("leaves another element's full screen alone on exit", async () => {
    const { result } = setup();
    const other = document.createElement('section');

    act(() => setFullscreenElement(other));
    await act(() => result.current.exit());

    expect(exitFullscreen).not.toHaveBeenCalled();
    expect(document.fullscreenElement).toBe(other);
  });

  it('stores a rejected request in error instead of throwing', async () => {
    const { result } = setup();
    const failure = new TypeError('Permissions check failed');

    requestFullscreen.mockRejectedValueOnce(failure);
    await act(() => result.current.enter());

    expect(result.current.error).toBe(failure);
    expect(result.current.isFullscreen).toBe(false);

    await act(() => result.current.enter());

    expect(result.current.error).toBeNull();
    expect(result.current.isFullscreen).toBe(true);
  });

  it('wraps a rejection that is not an Error', async () => {
    const { result } = setup();

    requestFullscreen.mockRejectedValueOnce('denied');
    await act(() => result.current.enter());

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('denied');
  });

  it('reports isSupported as false when full screen is disabled', () => {
    fullscreenEnabled = false;

    const { result } = setup();

    expect(result.current.isSupported).toBe(false);
  });

  it('does nothing before the ref is attached', async () => {
    const { result } = renderHook(() => useFullscreen());

    await act(() => result.current.enter());

    expect(requestFullscreen).not.toHaveBeenCalled();
    expect(result.current.isFullscreen).toBe(false);
  });

  it('keeps ref, enter, exit and toggle stable across renders', async () => {
    const { result } = setup();
    const first = result.current;

    await act(() => result.current.enter());

    expect(result.current.ref).toBe(first.ref);
    expect(result.current.enter).toBe(first.enter);
    expect(result.current.exit).toBe(first.exit);
    expect(result.current.toggle).toBe(first.toggle);
  });
});
