import { createElement, memo } from 'react';

import { act, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import useMap, { type MapActions } from './use-map';

describe('useMap', () => {
  it('starts empty without an initial value', () => {
    const { result } = renderHook(() => useMap<string, number>());

    expect([...result.current[0]]).toEqual([]);
  });

  it('starts from an iterable or a lazy function', () => {
    const fromIterable = renderHook(() =>
      useMap([
        ['a', 1],
        ['b', 2],
      ]),
    );
    const fromFunction = renderHook(() => useMap(() => new Map([['c', 3]])));

    expect([...fromIterable.result.current[0]]).toEqual([
      ['a', 1],
      ['b', 2],
    ]);
    expect([...fromFunction.result.current[0]]).toEqual([['c', 3]]);
  });

  it('reads initial on the first render only', () => {
    const { result, rerender } = renderHook(({ initial }) => useMap(initial), {
      initialProps: { initial: [['a', 1]] as [string, number][] },
    });

    rerender({ initial: [['b', 2]] });

    expect([...result.current[0]]).toEqual([['a', 1]]);
  });

  it('sets, updates, deletes, sets all and clears', () => {
    const { result } = renderHook(() => useMap<string, number>());

    act(() => result.current[1].set('a', 1));
    act(() => result.current[1].set('b', 2));
    expect([...result.current[0]]).toEqual([
      ['a', 1],
      ['b', 2],
    ]);

    act(() => result.current[1].update('a', previous => (previous ?? 0) + 10));
    act(() => result.current[1].update('c', previous => (previous ?? 0) + 1));
    expect([...result.current[0]]).toEqual([
      ['a', 11],
      ['b', 2],
      ['c', 1],
    ]);

    act(() => result.current[1].delete('a'));
    expect([...result.current[0].keys()]).toEqual(['b', 'c']);

    act(() =>
      result.current[1].setAll([
        ['x', 7],
        ['y', 8],
      ]),
    );
    expect([...result.current[0]]).toEqual([
      ['x', 7],
      ['y', 8],
    ]);

    act(() => result.current[1].clear());
    expect(result.current[0].size).toBe(0);
  });

  it('keeps keys that are not strings', () => {
    const key = { id: 1 };
    const { result } = renderHook(() => useMap<object, string>());

    act(() => result.current[1].set(key, 'draft'));

    expect(result.current[0].get(key)).toBe('draft');
    expect(result.current[0].get({ id: 1 })).toBeUndefined();
  });

  it('returns a new Map on every change', () => {
    const { result } = renderHook(() => useMap([['a', 1]]));
    const first = result.current[0];

    act(() => result.current[1].set('b', 2));

    expect(result.current[0]).not.toBe(first);
    expect([...first]).toEqual([['a', 1]]);
  });

  it.each<[string, (actions: MapActions<string, number>) => void]>([
    ['setting a key to its current value', actions => actions.set('a', 1)],
    [
      'updating a key to its current value',
      actions => actions.update('b', previous => previous!),
    ],
    ['deleting a missing key', actions => actions.delete('z')],
    [
      'setting all to the same entries',
      actions =>
        actions.setAll([
          ['b', 2],
          ['a', 1],
        ]),
    ],
  ])('keeps the same Map when %s', (_, run) => {
    const { result } = renderHook(() =>
      useMap([
        ['a', 1],
        ['b', 2],
      ]),
    );
    const first = result.current[0];

    act(() => run(result.current[1]));

    expect(result.current[0]).toBe(first);
  });

  it('compares values with Object.is', () => {
    const { result } = renderHook(() => useMap([['a', NaN]]));
    const first = result.current[0];

    act(() => result.current[1].set('a', NaN));
    expect(result.current[0]).toBe(first);

    act(() => result.current[1].set('a', 0));
    act(() => result.current[1].set('a', -0));
    expect(Object.is(result.current[0].get('a'), -0)).toBe(true);
  });

  it('adds a missing key set to undefined', () => {
    const { result } = renderHook(() => useMap<string, undefined>());

    act(() => result.current[1].set('a', undefined));

    expect(result.current[0].has('a')).toBe(true);
  });

  it('keeps the same Map when clearing an empty one', () => {
    const { result } = renderHook(() => useMap<string, number>());
    const first = result.current[0];

    act(() => result.current[1].clear());

    expect(result.current[0]).toBe(first);
  });

  it('does not re-render a memo child for an action that changes nothing', () => {
    let childRenders = 0;
    let actions: MapActions<string, number> | undefined;

    const Child = memo(
      ({ entries }: { entries: ReadonlyMap<string, number> }) => {
        childRenders += 1;

        return createElement(
          'span',
          null,
          [...entries].map(([key, value]) => `${key}=${value}`).join(','),
        );
      },
    );

    const Parent = () => {
      const [entries, mapActions] = useMap([['a', 1]]);

      actions = mapActions;

      return createElement(Child, { entries });
    };

    render(createElement(Parent));
    const initial = childRenders;

    act(() => actions!.set('a', 1));
    act(() => actions!.delete('z'));

    expect(childRenders).toBe(initial);

    act(() => actions!.set('b', 2));

    expect(childRenders).toBe(initial + 1);
    expect(screen.getByText('a=1,b=2')).toBeTruthy();
  });

  it('keeps one identity for the actions object and each action', () => {
    const { result } = renderHook(() => useMap<string, number>());
    const first = result.current[1];
    const { set, update } = first;

    act(() => result.current[1].set('a', 1));

    expect(result.current[1]).toBe(first);
    expect(result.current[1].set).toBe(set);
    expect(result.current[1].update).toBe(update);
  });

  it('lets several updates in one event build on each other', () => {
    const { result } = renderHook(() => useMap<string, number>());

    act(() => {
      result.current[1].update('count', previous => (previous ?? 0) + 1);
      result.current[1].update('count', previous => (previous ?? 0) + 1);
      result.current[1].set('other', 5);
      result.current[1].update('count', previous => (previous ?? 0) + 1);
    });

    expect([...result.current[0]]).toEqual([
      ['count', 3],
      ['other', 5],
    ]);
  });
});
