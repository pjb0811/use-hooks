import { useState } from 'react';

import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

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

  describe('without a re-render', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    const renderIgnoredEditor = () => {
      const sent: string[] = [];
      const { result, unmount } = renderHook(() => {
        // The parent never applies the change, so nothing re-renders.
        const [document] = useState('a');
        const pending = usePendingCommit<string, Payload>(document);

        return (text: string) => {
          const next = (pending.read()?.code ?? document) + text;

          pending.write({ code: next });
          sent.push(next);
        };
      });

      return { append: (text: string) => result.current(text), sent, unmount };
    };

    it('starts the next event from base after a rejected change', () => {
      vi.useFakeTimers();
      const { append, sent } = renderIgnoredEditor();

      act(() => append('b'));
      act(() => vi.advanceTimersByTime(0));
      act(() => append('c'));

      expect(sent).toEqual(['ab', 'ac']);
    });

    it('still builds on a write from the same task', () => {
      vi.useFakeTimers();
      const { append, sent } = renderIgnoredEditor();

      act(() => {
        append('b');
        append('c');
      });

      expect(sent).toEqual(['ab', 'abc']);
    });

    it('leaves no timer after unmount', () => {
      vi.useFakeTimers();
      const { append, unmount } = renderIgnoredEditor();

      act(() => append('b'));
      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });
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
