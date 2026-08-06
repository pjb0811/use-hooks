import { useCallback, useEffect, useMemo, useState } from 'react';

const useMultiSelect = (count: number) => {
  const [rawSelected, setRawSelected] = useState<Set<number>>(new Set());
  const [anchor, setAnchor] = useState<number | null>(null);

  const selected = useMemo(() => {
    const next = new Set([...rawSelected].filter(index => index < count));
    return next.size === rawSelected.size ? rawSelected : next;
  }, [rawSelected, count]);

  // Clamp `rawSelected`/`anchor` themselves (not just the derived
  // `selected` view above) whenever `count` shrinks — otherwise
  // out-of-range indices and a stale anchor keep accumulating in state
  // indefinitely instead of actually being dropped.
  useEffect(() => {
    setRawSelected(prev => {
      const next = new Set([...prev].filter(index => index < count));
      return next.size === prev.size ? prev : next;
    });
    setAnchor(prev => (prev !== null && prev >= count ? null : prev));
  }, [count]);

  const toggle = useCallback(
    (index: number, shiftKey = false) => {
      if (index < 0 || index >= count) {
        return;
      }

      setRawSelected(prev => {
        if (shiftKey && anchor !== null) {
          const [start, end] =
            anchor < index ? [anchor, index] : [index, anchor];

          // Range-select replaces the previous selection, matching the
          // usual file-explorer/table convention, instead of adding to
          // it — otherwise repeated shift-clicks just accumulate every
          // range ever selected rather than re-anchoring to the new one.
          const next = new Set<number>();
          for (let i = start; i <= end; i++) {
            next.add(i);
          }
          return next;
        }

        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
      setAnchor(index);
    },
    [anchor, count],
  );

  const clear = useCallback(() => {
    setRawSelected(new Set());
    setAnchor(null);
  }, []);

  const replace = useCallback(
    (indices: Set<number>) => {
      setRawSelected(
        new Set([...indices].filter(index => index >= 0 && index < count)),
      );
    },
    [count],
  );

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
