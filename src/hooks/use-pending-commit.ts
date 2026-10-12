import { useEffect, useMemo, useState } from 'react';

// `read` returns the last `write` while it is still built on the current
// `base`, and `undefined` otherwise.
export interface PendingCommit<P> {
  read: () => P | undefined;
  write: (next: P) => void;
}

const createRecordStore = <B, P>() => {
  let record: { from: B; payload: P } | undefined;

  return {
    get: () => record,
    set: (next: { from: B; payload: P }) => {
      record = next;
    },
    clear: () => {
      record = undefined;
    },
  };
};

// Remembers the last result a controlled component committed through
// `onChange` until the parent renders again, so a second commit in the same
// tick builds on the first instead of on the old prop. Pass the value this
// render was built from (the prop the parent controls) as `base`.
//
// A write lasts until the effects of the next commit run. It is also
// ignored as soon as a render's `base` differs from the one it was written
// on (`Object.is`), so a render that already received the new value never
// sees it. A rerender with the same `base` clears it too, which is how a
// parent that rejects the change is handled. The hook can't tell that apart
// from a parent that applies the change later (`startTransition`, a
// debounce): if the component renders in between, the write is dropped.
//
// The returned object keeps its identity while `base` stays the same. The
// record lives in `useState`, not a ref, so `read` may be called from code
// built during render. It is cleared in an effect, so a write made from an
// effect declared before this hook in the same commit is cleared right away.
const usePendingCommit = <B, P>(base: B): PendingCommit<P> => {
  const [store] = useState(createRecordStore<B, P>);

  useEffect(() => {
    store.clear();
  });

  return useMemo(
    () => ({
      read: () => {
        const record = store.get();

        return record && Object.is(record.from, base)
          ? record.payload
          : undefined;
      },
      write: (next: P) => {
        store.set({ from: base, payload: next });
      },
    }),
    [store, base],
  );
};

export default usePendingCommit;
