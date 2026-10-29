import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import useAsync from './use-async';

// A promise to settle by hand, plus the signal its task received.
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

// Lets the effect's `then` callbacks run inside `act`.
const settle = () => act(async () => {});

describe('useAsync', () => {
  it('is pending, then holds the value on success', async () => {
    const run = deferred<string>();
    const { result } = renderHook(() => useAsync(() => run.promise, []));

    expect(result.current).toEqual({
      status: 'pending',
      value: undefined,
      error: null,
    });

    run.resolve('done');
    await settle();

    expect(result.current).toEqual({
      status: 'success',
      value: 'done',
      error: null,
    });
  });

  it('holds the error on rejection', async () => {
    const run = deferred<string>();
    const failure = new Error('offline');
    const { result } = renderHook(() => useAsync(() => run.promise, []));

    run.reject(failure);
    await settle();

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(failure);
  });

  it('wraps a rejection that is not an Error, and a task that throws', async () => {
    const rejected = renderHook(() =>
      useAsync(() => Promise.reject('nope'), []),
    );
    const thrown = renderHook(() =>
      useAsync(() => {
        throw new Error('sync');
      }, []),
    );

    await settle();

    expect(rejected.result.current.error).toBeInstanceOf(Error);
    expect(rejected.result.current.error?.message).toBe('nope');
    expect(thrown.result.current.status).toBe('error');
    expect(thrown.result.current.error?.message).toBe('sync');
  });

  it('ignores a slow run that settles after deps changed', async () => {
    const runs = { a: deferred<string>(), b: deferred<string>() };
    const { result, rerender } = renderHook(
      ({ id }) => useAsync(() => runs[id].promise, [id]),
      { initialProps: { id: 'a' as 'a' | 'b' } },
    );

    rerender({ id: 'b' });
    runs.b.resolve('b');
    await settle();
    runs.a.resolve('a');
    await settle();

    expect(result.current.value).toBe('b');
  });

  it('ignores a rejection from a run that is no longer current', async () => {
    const runs = { a: deferred<string>(), b: deferred<string>() };
    const { result, rerender } = renderHook(
      ({ id }) => useAsync(() => runs[id].promise, [id]),
      { initialProps: { id: 'a' as 'a' | 'b' } },
    );

    rerender({ id: 'b' });
    runs.a.reject(new Error('late'));
    await settle();

    expect(result.current.status).toBe('pending');
    expect(result.current.error).toBeNull();
  });

  it('aborts the signal when deps change, on unmount and when disabled', () => {
    const signals: AbortSignal[] = [];
    const task = (signal: AbortSignal) => {
      signals.push(signal);

      return new Promise<never>(() => {});
    };
    const { rerender, unmount } = renderHook(
      ({ id, enabled }) => useAsync(task, [id], { enabled }),
      { initialProps: { id: 1, enabled: true } },
    );

    rerender({ id: 2, enabled: true });
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);

    rerender({ id: 2, enabled: false });
    expect(signals[1].aborted).toBe(true);

    rerender({ id: 2, enabled: true });
    expect(signals[2].aborted).toBe(false);

    unmount();
    expect(signals[2].aborted).toBe(true);
  });

  it('keeps the previous value while a new run is pending', async () => {
    const runs = { a: deferred<string>(), b: deferred<string>() };
    const { result, rerender } = renderHook(
      ({ id }) => useAsync(() => runs[id].promise, [id]),
      { initialProps: { id: 'a' as 'a' | 'b' } },
    );

    runs.a.resolve('a');
    await settle();
    rerender({ id: 'b' });

    expect(result.current.status).toBe('pending');
    expect(result.current.value).toBe('a');

    runs.b.reject(new Error('failed'));
    await settle();

    expect(result.current.status).toBe('error');
    expect(result.current.value).toBe('a');
  });

  it('clears the error when the next run starts', async () => {
    const runs = { a: deferred<string>(), b: deferred<string>() };
    const { result, rerender } = renderHook(
      ({ id }) => useAsync(() => runs[id].promise, [id]),
      { initialProps: { id: 'a' as 'a' | 'b' } },
    );

    runs.a.reject(new Error('failed'));
    await settle();
    rerender({ id: 'b' });

    expect(result.current.status).toBe('pending');
    expect(result.current.error).toBeNull();
  });

  it('stays idle and does not run while disabled', async () => {
    const task = vi.fn(() => Promise.resolve('x'));
    const { result, rerender } = renderHook(
      ({ enabled }) => useAsync(task, [], { enabled }),
      { initialProps: { enabled: false } },
    );

    await settle();

    expect(task).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');

    rerender({ enabled: true });

    expect(result.current.status).toBe('pending');

    await settle();

    expect(task).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual({
      status: 'success',
      value: 'x',
      error: null,
    });
  });

  it('does not run again for a new inline task on every render', async () => {
    const calls = vi.fn();
    const { rerender } = renderHook(
      ({ label }) =>
        useAsync(() => {
          calls(label);

          return Promise.resolve(label);
        }, []),
      { initialProps: { label: 'first' } },
    );

    rerender({ label: 'second' });
    rerender({ label: 'third' });
    await settle();

    expect(calls).toHaveBeenCalledTimes(1);
  });

  it('runs the task from the latest render when deps change', async () => {
    const calls = vi.fn();
    const { rerender } = renderHook(
      ({ id, label }) =>
        useAsync(() => {
          calls(label);

          return Promise.resolve(label);
        }, [id]),
      { initialProps: { id: 1, label: 'first' } },
    );

    rerender({ id: 2, label: 'second' });
    await settle();

    expect(calls).toHaveBeenLastCalledWith('second');
  });
});
