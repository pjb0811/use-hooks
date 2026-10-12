import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import useStableValue from './use-stable-value';

const render = <T>(value: T, isEqual?: (previous: T, next: T) => boolean) =>
  renderHook(({ value }) => useStableValue(value, isEqual), {
    initialProps: { value },
  });

describe('useStableValue', () => {
  it('keeps the reference for a new but shallowly equal object', () => {
    const first = { a: 1, b: 'x' };
    const { result, rerender } = render(first);

    rerender({ value: { a: 1, b: 'x' } });

    expect(result.current).toBe(first);
  });

  it.each([
    ['a key is added', { a: 1, b: 'x', c: true }],
    ['a key is removed', { a: 1 }],
    ['a value changes', { a: 2, b: 'x' }],
  ])('returns the new object in the same render when %s', (_, next) => {
    const { result, rerender } = render<Record<string, unknown>>({
      a: 1,
      b: 'x',
    });

    rerender({ value: next });

    expect(result.current).toBe(next);
  });

  it('counts a nested object with a new identity as a change', () => {
    const { result, rerender } = render({ style: { color: 'red' } });
    const next = { style: { color: 'red' } };

    rerender({ value: next });

    expect(result.current).toBe(next);
  });

  it('keeps an array with the same items and replaces one that differs', () => {
    const first = [1, 2];
    const { result, rerender } = render(first);

    rerender({ value: [1, 2] });
    expect(result.current).toBe(first);

    const longer = [1, 2, 3];
    rerender({ value: longer });
    expect(result.current).toBe(longer);

    const changed = [1, 4, 3];
    rerender({ value: changed });
    expect(result.current).toBe(changed);
  });

  it('keeps the new value after it changes', () => {
    const { result, rerender } = render({ a: 1 });
    const next = { a: 2 };

    rerender({ value: next });
    rerender({ value: { a: 2 } });

    expect(result.current).toBe(next);
  });

  it('compares objects that are not plain by identity', () => {
    const { result, rerender } = render(new Date(0));
    const next = new Date(0);

    rerender({ value: next });

    expect(result.current).toBe(next);
  });

  it('stores a function value instead of calling it', () => {
    const fn = () => 'called';
    const { result } = render(fn);

    expect(result.current).toBe(fn);
  });

  it('handles undefined and primitives', () => {
    const { result, rerender } = render<{ a: number } | undefined>(undefined);

    expect(result.current).toBeUndefined();

    const next = { a: 1 };
    rerender({ value: next });

    expect(result.current).toBe(next);
  });

  it('uses a custom isEqual in place of the default', () => {
    const first = { id: 1, label: 'a' };
    const { result, rerender } = render(first, (a, b) => a.id === b.id);

    rerender({ value: { id: 1, label: 'b' } });

    expect(result.current).toBe(first);
  });
});
