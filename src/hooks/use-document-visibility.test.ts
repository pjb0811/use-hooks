import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import useDocumentVisibility from './use-document-visibility';

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
};

const changeVisibility = (state: DocumentVisibilityState) => {
  setVisibility(state);
  document.dispatchEvent(new Event('visibilitychange'));
};

describe('useDocumentVisibility', () => {
  afterEach(() => {
    Reflect.deleteProperty(document, 'visibilityState');
    vi.restoreAllMocks();
  });

  it('is true while the page is visible', () => {
    setVisibility('visible');

    const { result } = renderHook(() => useDocumentVisibility());

    expect(result.current).toBe(true);
  });

  it('is false when the page starts hidden', () => {
    setVisibility('hidden');

    const { result } = renderHook(() => useDocumentVisibility());

    expect(result.current).toBe(false);
  });

  it('follows visibilitychange between hidden and visible', () => {
    setVisibility('visible');

    const { result } = renderHook(() => useDocumentVisibility());

    act(() => changeVisibility('hidden'));
    expect(result.current).toBe(false);

    act(() => changeVisibility('visible'));
    expect(result.current).toBe(true);
  });

  it('shares one answer between components', () => {
    setVisibility('visible');

    const first = renderHook(() => useDocumentVisibility());
    const second = renderHook(() => useDocumentVisibility());

    act(() => changeVisibility('hidden'));

    expect(first.result.current).toBe(false);
    expect(second.result.current).toBe(false);
  });

  it('removes its listener on unmount', () => {
    const remove = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderHook(() => useDocumentVisibility());

    unmount();

    expect(remove).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    );
  });

  it('renders as visible on the server, whatever the current state', () => {
    setVisibility('hidden');

    const Probe = () => String(useDocumentVisibility());

    expect(renderToString(createElement(Probe))).toBe('true');
  });
});
