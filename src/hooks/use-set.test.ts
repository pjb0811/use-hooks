import { createElement, memo } from 'react';

import { act, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import useSet, { type SetActions } from './use-set';

describe('useSet', () => {
  it('starts empty without an initial value', () => {
    const { result } = renderHook(() => useSet<string>());

    expect([...result.current[0]]).toEqual([]);
  });

  it('starts from an iterable or a lazy function', () => {
    const fromIterable = renderHook(() => useSet(['a', 'b']));
    const fromFunction = renderHook(() => useSet(() => new Set(['c'])));

    expect([...fromIterable.result.current[0]]).toEqual(['a', 'b']);
    expect([...fromFunction.result.current[0]]).toEqual(['c']);
  });

  it('reads initial on the first render only', () => {
    const { result, rerender } = renderHook(({ initial }) => useSet(initial), {
      initialProps: { initial: ['a'] },
    });

    rerender({ initial: ['b'] });

    expect([...result.current[0]]).toEqual(['a']);
  });

  it('adds, deletes, sets and clears', () => {
    const { result } = renderHook(() => useSet<string>());

    act(() => result.current[1].add('a'));
    act(() => result.current[1].add('b'));
    expect([...result.current[0]]).toEqual(['a', 'b']);

    act(() => result.current[1].delete('a'));
    expect([...result.current[0]]).toEqual(['b']);

    act(() => result.current[1].set(['x', 'y']));
    expect([...result.current[0]]).toEqual(['x', 'y']);

    act(() => result.current[1].clear());
    expect(result.current[0].size).toBe(0);
  });

  it('toggles a value, and with force only adds or only removes', () => {
    const { result } = renderHook(() => useSet<string>());

    act(() => result.current[1].toggle('a'));
    expect(result.current[0].has('a')).toBe(true);

    act(() => result.current[1].toggle('a'));
    expect(result.current[0].has('a')).toBe(false);

    act(() => result.current[1].toggle('a', true));
    act(() => result.current[1].toggle('a', true));
    expect(result.current[0].has('a')).toBe(true);

    act(() => result.current[1].toggle('a', false));
    act(() => result.current[1].toggle('a', false));
    expect(result.current[0].has('a')).toBe(false);
  });

  it('returns a new Set on every change', () => {
    const { result } = renderHook(() => useSet(['a']));
    const first = result.current[0];

    act(() => result.current[1].add('b'));

    expect(result.current[0]).not.toBe(first);
    expect([...first]).toEqual(['a']);
  });

  it.each<[string, (actions: SetActions<string>) => void]>([
    ['adding a present value', actions => actions.add('a')],
    ['deleting a missing value', actions => actions.delete('z')],
    [
      'toggling with a force that matches',
      actions => actions.toggle('a', true),
    ],
    ['setting the same values', actions => actions.set(['b', 'a'])],
  ])('keeps the same Set when %s', (_, run) => {
    const { result } = renderHook(() => useSet(['a', 'b']));
    const first = result.current[0];

    act(() => run(result.current[1]));

    expect(result.current[0]).toBe(first);
  });

  it('keeps the same Set when clearing an empty one', () => {
    const { result } = renderHook(() => useSet<string>());
    const first = result.current[0];

    act(() => result.current[1].clear());

    expect(result.current[0]).toBe(first);
  });

  it('does not re-render a memo child for an action that changes nothing', () => {
    let childRenders = 0;
    let actions: SetActions<string> | undefined;

    const Child = memo(({ values }: { values: ReadonlySet<string> }) => {
      childRenders += 1;

      return createElement('span', null, [...values].join(','));
    });

    const Parent = () => {
      const [values, setActions] = useSet(['a']);

      actions = setActions;

      return createElement(Child, { values });
    };

    render(createElement(Parent));
    const initial = childRenders;

    act(() => actions!.add('a'));
    act(() => actions!.delete('z'));

    expect(childRenders).toBe(initial);

    act(() => actions!.add('b'));

    expect(childRenders).toBe(initial + 1);
    expect(screen.getByText('a,b')).toBeTruthy();
  });

  it('keeps one identity for the actions object and each action', () => {
    const { result } = renderHook(() => useSet<string>());
    const first = result.current[1];
    const { add, toggle } = first;

    act(() => result.current[1].add('a'));

    expect(result.current[1]).toBe(first);
    expect(result.current[1].add).toBe(add);
    expect(result.current[1].toggle).toBe(toggle);
  });

  it('lets several actions in one event build on each other', () => {
    const { result } = renderHook(() => useSet<string>());

    act(() => {
      result.current[1].add('a');
      result.current[1].add('b');
      result.current[1].toggle('a');
      result.current[1].add('c');
    });

    expect([...result.current[0]]).toEqual(['b', 'c']);
  });
});
