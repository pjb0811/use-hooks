import { useState } from 'react';

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import usePendingCommit from './use-pending-commit';

interface Payload {
  code: string;
}

describe('usePendingCommit', () => {
  it('reads undefined before any write', () => {
    const { result } = renderHook(() => usePendingCommit<string, Payload>('a'));

    expect(result.current.read()).toBeUndefined();
  });

  it('reads the last of two writes made in the same tick', () => {
    const { result } = renderHook(() => usePendingCommit<string, Payload>('a'));

    act(() => {
      result.current.write({ code: 'ab' });
      result.current.write({ code: 'abc' });
    });

    expect(result.current.read()).toEqual({ code: 'abc' });
  });

  it('lets a second commit in the same tick build on the first', () => {
    const { result } = renderHook(() => {
      const [document, setDocument] = useState('a');
      const pending = usePendingCommit<string, Payload>(document);

      const append = (text: string) => {
        const next = (pending.read()?.code ?? document) + text;

        pending.write({ code: next });
        setDocument(next);
      };

      return { document, append };
    });

    act(() => {
      result.current.append('b');
      result.current.append('c');
    });

    expect(result.current.document).toBe('abc');
  });

  it('reads undefined after a rerender with a new base', () => {
    const { result, rerender } = renderHook(
      ({ base }) => usePendingCommit<string, Payload>(base),
      { initialProps: { base: 'a' } },
    );

    act(() => result.current.write({ code: 'ab' }));
    rerender({ base: 'ab' });

    expect(result.current.read()).toBeUndefined();
  });

  it('reads undefined after a rerender with the same base', () => {
    const { result, rerender } = renderHook(
      ({ base }) => usePendingCommit<string, Payload>(base),
      { initialProps: { base: 'a' } },
    );

    act(() => result.current.write({ code: 'ab' }));
    rerender({ base: 'a' });

    expect(result.current.read()).toBeUndefined();
  });

  it('ignores the write during a render whose base already changed', () => {
    const seen: (Payload | undefined)[] = [];
    const { result, rerender } = renderHook(
      ({ base }) => {
        const pending = usePendingCommit<string, Payload>(base);

        seen.push(pending.read());

        return pending;
      },
      { initialProps: { base: 'a' } },
    );

    act(() => result.current.write({ code: 'ab' }));
    rerender({ base: 'normalized' });

    expect(seen).toEqual([undefined, undefined]);
  });

  it('keeps the same object while the base stays the same', () => {
    const { result, rerender } = renderHook(
      ({ base }) => usePendingCommit<string, Payload>(base),
      { initialProps: { base: 'a' } },
    );
    const first = result.current;

    rerender({ base: 'a' });

    expect(result.current).toBe(first);
    expect(result.current.read).toBe(first.read);
    expect(result.current.write).toBe(first.write);
  });
});
