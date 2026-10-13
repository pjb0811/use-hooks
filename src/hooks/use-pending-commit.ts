import { useEffect, useMemo, useState } from 'react';

// `read` returns the last `write` while it is still built on the current
// `base`, and `undefined` otherwise.
export interface PendingCommit<P> {
  read: () => P | undefined;
  write: (next: P) => void;
}

// Holds the last write and drops it at the end of the task it was made in.
// Writes in the same task share one timer, so they still build on each
// other.
const createRecordStore = <B, P>() => {
  let record: { from: B; payload: P } | undefined;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const clear = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }

    record = undefined;
  };

  return {
    get: () => record,
    set: (next: { from: B; payload: P }) => {
      record = next;

      if (timeoutId === undefined) {
        timeoutId = setTimeout(clear, 0);
      }
    },
    clear,
  };
};

// Remembers the last result a controlled component committed through
// `onChange` until the parent renders again, so a second commit in the same
// tick builds on the first instead of on the old prop. Pass the value this
// render was built from (the prop the parent controls) as `base`.
//
// A write lasts until the end of the task it was made in, or until the
// effects of the next commit run if that comes first. It is also ignored as
// soon as a render's `base` differs from the one it was written on
// (`Object.is`), so a render that already received the new value never sees
// it. A parent that rejects the change, by rendering with the same `base` or
// by not rendering at all, leaves the next event to start from `base` again
// (#273). A parent that applies the change later (`startTransition`, a
// debounce) can't be told apart from that, so the write is dropped for it
// too.
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

  // Drops a pending write and its timer on unmount.
  useEffect(() => store.clear, [store]);

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
