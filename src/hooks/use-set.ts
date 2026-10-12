import { useState } from 'react';

// Each action replaces the state with a new `Set`, or keeps the current one
// when nothing would change.
export interface SetActions<T> {
  add: (value: T) => void;
  delete: (value: T) => void;
  // Adds `value` when it is missing and removes it when present. With
  // `force`, `true` only adds and `false` only removes, like
  // `classList.toggle`.
  toggle: (value: T, force?: boolean) => void;
  // Replaces the contents with `values`.
  set: (values: Iterable<T>) => void;
  clear: () => void;
}

const hasSameValues = <T>(a: ReadonlySet<T>, b: ReadonlySet<T>) =>
  a.size === b.size && [...a].every(value => b.has(value));

// Holds a set of keys in state. Every change produces a new `Set`, so the
// value works as a dependency and with `memo`; an action that changes
// nothing keeps the current one. `initial` (an iterable or a function
// returning one) is read on the first render only, as with `useState`.
//
// The actions object and each action keep one identity for the life of the
// component. `delete` is a reserved word, so call it as `actions.delete(x)`
// or rename it when destructuring (`{ delete: remove }`).
const useSet = <T>(
  initial?: Iterable<T> | (() => Iterable<T>),
): [ReadonlySet<T>, SetActions<T>] => {
  const [values, setValues] = useState<ReadonlySet<T>>(
    () => new Set(typeof initial === 'function' ? initial() : initial),
  );

  const [actions] = useState<SetActions<T>>(() => ({
    add: value =>
      setValues(previous =>
        previous.has(value) ? previous : new Set(previous).add(value),
      ),
    delete: value =>
      setValues(previous => {
        if (!previous.has(value)) {
          return previous;
        }

        const next = new Set(previous);

        next.delete(value);

        return next;
      }),
    toggle: (value, force) =>
      setValues(previous => {
        const isPresent = previous.has(value);

        if ((force ?? !isPresent) === isPresent) {
          return previous;
        }

        const next = new Set(previous);

        if (isPresent) {
          next.delete(value);
        } else {
          next.add(value);
        }

        return next;
      }),
    set: nextValues =>
      setValues(previous => {
        const next = new Set(nextValues);

        return hasSameValues(previous, next) ? previous : next;
      }),
    clear: () =>
      setValues(previous => (previous.size === 0 ? previous : new Set())),
  }));

  return [values, actions];
};

export default useSet;
