import { useState } from 'react';

// Each action replaces the state with a new `Map`, or keeps the current one
// when nothing would change.
export interface MapActions<K, V> {
  set: (key: K, value: V) => void;
  // Sets `key` to what `updater` returns for its current value (`undefined`
  // when missing). Several updates in one event build on each other.
  update: (key: K, updater: (previous: V | undefined) => V) => void;
  delete: (key: K) => void;
  // Replaces the contents with `entries`.
  setAll: (entries: Iterable<readonly [K, V]>) => void;
  clear: () => void;
}

const hasSameEntries = <K, V>(a: ReadonlyMap<K, V>, b: ReadonlyMap<K, V>) =>
  a.size === b.size &&
  [...a].every(([key, value]) => b.has(key) && Object.is(b.get(key), value));

// Holds key-value pairs in state. Every change produces a new `Map`, so the
// value works as a dependency and with `memo`; an action that changes
// nothing (values compared with `Object.is`) keeps the current one.
// `initial` (an iterable of entries or a function returning one) is read on
// the first render only, as with `useState`.
//
// The actions object and each action keep one identity for the life of the
// component. `delete` is a reserved word, so call it as `actions.delete(x)`
// or rename it when destructuring (`{ delete: remove }`).
const useMap = <K, V>(
  initial?: Iterable<readonly [K, V]> | (() => Iterable<readonly [K, V]>),
): [ReadonlyMap<K, V>, MapActions<K, V>] => {
  const [entries, setEntries] = useState<ReadonlyMap<K, V>>(
    () => new Map(typeof initial === 'function' ? initial() : initial),
  );

  const [actions] = useState<MapActions<K, V>>(() => {
    const write = (key: K, getValue: (previous: V | undefined) => V) =>
      setEntries(previous => {
        const value = getValue(previous.get(key));

        if (previous.has(key) && Object.is(previous.get(key), value)) {
          return previous;
        }

        return new Map(previous).set(key, value);
      });

    return {
      set: (key, value) => write(key, () => value),
      update: write,
      delete: key =>
        setEntries(previous => {
          if (!previous.has(key)) {
            return previous;
          }

          const next = new Map(previous);

          next.delete(key);

          return next;
        }),
      setAll: nextEntries =>
        setEntries(previous => {
          const next = new Map(nextEntries);

          return hasSameEntries(previous, next) ? previous : next;
        }),
      clear: () =>
        setEntries(previous => (previous.size === 0 ? previous : new Map())),
    };
  });

  return [entries, actions];
};

export default useMap;
