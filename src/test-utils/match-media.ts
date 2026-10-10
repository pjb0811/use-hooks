import { vi } from 'vitest';

// jsdom has no `matchMedia`. This installs one on `view` (default `window`)
// whose `matches` comes from `matches[query]` and whose `change` listeners
// can be fired with `set`.
export const installMatchMedia = (
  initial: Record<string, boolean> = {},
  view: Window = window,
) => {
  const matches = { ...initial };
  const listeners = new Map<string, Set<() => void>>();

  const matchMedia = vi.fn((query: string) => ({
    get matches() {
      return matches[query] ?? false;
    },
    media: query,
    addEventListener: (_type: string, listener: () => void) => {
      const set = listeners.get(query) ?? new Set();

      set.add(listener);
      listeners.set(query, set);
    },
    removeEventListener: (_type: string, listener: () => void) => {
      listeners.get(query)?.delete(listener);
    },
  }));

  Object.defineProperty(view, 'matchMedia', {
    configurable: true,
    writable: true,
    value: matchMedia,
  });

  return {
    matchMedia,
    set: (query: string, value: boolean) => {
      matches[query] = value;
      listeners.get(query)?.forEach(listener => listener());
    },
    listenerCount: (query: string) => listeners.get(query)?.size ?? 0,
    uninstall: () => {
      Reflect.deleteProperty(view, 'matchMedia');
    },
  };
};
