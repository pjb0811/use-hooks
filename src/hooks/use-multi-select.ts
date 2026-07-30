import { useCallback, useMemo, useState } from 'react';

const useMultiSelect = (count: number) => {
  const [rawSelected, setRawSelected] = useState<Set<number>>(new Set());
  const [anchor, setAnchor] = useState<number | null>(null);

  // Indices can outlive the item they pointed to (e.g. after the backing
  // list shrinks) — clamp against the current count on every render
  // instead of syncing state back via an effect.
  const selected = useMemo(() => {
    const next = new Set([...rawSelected].filter(index => index < count));
    return next.size === rawSelected.size ? rawSelected : next;
  }, [rawSelected, count]);

  const toggle = useCallback(
    (index: number, shiftKey = false) => {
      setRawSelected(prev => {
        const next = new Set(prev);

        if (shiftKey && anchor !== null) {
          const [start, end] =
            anchor < index ? [anchor, index] : [index, anchor];

          for (let i = start; i <= end; i++) {
            next.add(i);
          }
          return next;
        }

        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
      setAnchor(index);
    },
    [anchor],
  );

  const clear = useCallback(() => {
    setRawSelected(new Set());
    setAnchor(null);
  }, []);

  const replace = useCallback((indices: Set<number>) => {
    setRawSelected(indices);
  }, []);

  const isSelected = useCallback(
    (index: number) => selected.has(index),
    [selected],
  );

  return {
    selected,
    isSelected,
    toggle,
    clear,
    replace,
  } as const;
};

export default useMultiSelect;
