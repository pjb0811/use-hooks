import { createElement } from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import useMergedRef from './use-merged-ref';

type Merge = Parameters<typeof useMergedRef<HTMLDivElement>>;

// Mounts a div whose ref is the merged ref of `refs`.
const mount = (...refs: Merge) => {
  const Probe = () => {
    const merged = useMergedRef<HTMLDivElement>(...refs);

    return createElement('div', { ref: merged });
  };

  return render(createElement(Probe));
};

describe('useMergedRef', () => {
  it('sets every object ref and calls every function ref with the node', () => {
    const objectRef = { current: null as HTMLDivElement | null };
    const functionRef = vi.fn();

    const { container } = mount(objectRef, functionRef);

    expect(objectRef.current).toBe(container.firstChild);
    expect(functionRef).toHaveBeenCalledWith(container.firstChild);
  });

  it('skips null and undefined refs', () => {
    const objectRef = { current: null as HTMLDivElement | null };

    const { container } = mount(null, undefined, objectRef);

    expect(objectRef.current).toBe(container.firstChild);
  });

  it('releases object refs and calls function refs with null on unmount', () => {
    const objectRef = { current: null as HTMLDivElement | null };
    const functionRef = vi.fn();
    const { unmount } = mount(objectRef, functionRef);

    unmount();

    expect(objectRef.current).toBeNull();
    expect(functionRef).toHaveBeenLastCalledWith(null);
  });

  it('runs a function ref cleanup instead of calling it with null', () => {
    const cleanup = vi.fn();
    const withCleanup = vi.fn(() => cleanup);
    const objectRef = { current: null as HTMLDivElement | null };
    const { unmount } = mount(withCleanup, objectRef);

    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(withCleanup).toHaveBeenCalledTimes(1);
    expect(objectRef.current).toBeNull();
  });

  it('keeps a plain function ref released when another ref has a cleanup', () => {
    const plain = vi.fn();
    const withCleanup = vi.fn(() => () => {});
    const { unmount } = mount(plain, withCleanup);

    unmount();

    expect(plain).toHaveBeenLastCalledWith(null);
  });
});
