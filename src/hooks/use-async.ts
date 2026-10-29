import { type DependencyList, useEffect, useState } from 'react';

import useLatest from './use-latest';

interface Options {
  // While false the task doesn't run and `status` is `'idle'`.
  enabled?: boolean;
}

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

interface AsyncState<T> {
  status: AsyncStatus;
  value: T | undefined;
  error: Error | null;
}

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)));

const isSameDeps = (a: DependencyList, b: DependencyList) =>
  a.length === b.length && a.every((dep, index) => Object.is(dep, b[index]));

// Runs `task` after commit and whenever `deps` change, and keeps its outcome
// in state. When `deps` change, the component unmounts or `enabled` turns
// false, the running task's `signal` aborts and whatever it settles with is
// ignored, so only the latest run sets state.
//
// `value` is the result of the last run that succeeded: it stays while a new
// run is pending or fails, so a view doesn't flash empty. `error` is the last
// run's rejection until the next run starts. `task` is read from the latest
// render, so passing a new inline function doesn't run it again; only `deps`
// and `enabled` do.
//
// For a promise created outside render (a cache or a loader), React's `use()`
// with Suspense fits better. This hook is for work that must start after
// commit without suspending the tree.
const useAsync = <T>(
  task: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
  { enabled = true }: Options = {},
): AsyncState<T> => {
  const [state, setState] = useState<AsyncState<T>>({
    status: enabled ? 'pending' : 'idle',
    value: undefined,
    error: null,
  });
  // The `deps` and `enabled` the current status belongs to.
  const [tracked, setTracked] = useState({ deps, enabled });

  const taskRef = useLatest(task);

  // Marks the new run as pending in the same render its inputs change,
  // instead of rendering the previous run's status once more.
  if (enabled !== tracked.enabled || !isSameDeps(deps, tracked.deps)) {
    setTracked({ deps, enabled });
    setState(previous => ({
      ...previous,
      status: enabled ? 'pending' : 'idle',
      error: null,
    }));
  }

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    let promise: Promise<T>;

    try {
      promise = Promise.resolve(taskRef.current(controller.signal));
    } catch (e) {
      promise = Promise.reject(e);
    }

    promise.then(
      value => {
        if (!controller.signal.aborted) {
          setState({ status: 'success', value, error: null });
        }
      },
      (e: unknown) => {
        if (!controller.signal.aborted) {
          setState(previous => ({
            ...previous,
            status: 'error',
            error: toError(e),
          }));
        }
      },
    );

    return () => controller.abort();
    // `deps` is the caller's dependency list, spread like React's own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, taskRef]);

  return state;
};

export default useAsync;
