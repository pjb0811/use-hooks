import { type FocusEvent, type KeyboardEvent, useRef } from 'react';

import useControllableState from './use-controllable-state';

interface Options {
  // Number of items in the group.
  count: number;
  // Which arrow keys move focus: Left/Right for `'horizontal'`, Up/Down for
  // `'vertical'`, all four for `'both'`.
  orientation?: 'horizontal' | 'vertical' | 'both';
  // Whether moving past the last item goes to the first, and the other way.
  loop?: boolean;
  // Initial active item. Ignored while `activeIndex` is passed.
  defaultIndex?: number;
  // Controlled active item. With it, the hook only reports changes through
  // `onActiveIndexChange` and never changes the Tab stop on its own.
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  // Items for which this returns true are skipped while moving.
  isDisabled?: (index: number) => boolean;
}

interface ItemProps {
  tabIndex: 0 | -1;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  ref: (element: HTMLElement | null) => void;
}

const PREVIOUS = -1;
const NEXT = 1;

const isRtl = (element: Element) =>
  getComputedStyle(element).direction === 'rtl';

// Gives a group of items (a menu, toolbar, list or tab list) a single Tab
// stop, and moves focus between them with the arrow keys, following the
// WAI-ARIA roving tabindex pattern. Spread `getItemProps(index)` onto each
// item. The active item has `tabIndex` 0 and the rest -1, so Tabbing out and
// back in returns to the item the user left. Focusing an item by click or
// from code also makes it the active one.
//
// Arrow keys for `orientation` move to the previous or next item that isn't
// disabled, wrapping at the ends while `loop` is true, and Home and End move
// to the first and last. Side by side in a right-to-left element, Left and
// Right swap. Enter, Space, Escape and typeahead are left to the caller;
// compose them with the returned `onKeyDown`. When `count` shrinks below the
// active index, the last item becomes the active one.
const useRovingFocus = ({
  count,
  orientation = 'vertical',
  loop = true,
  defaultIndex = 0,
  activeIndex: activeIndexProp,
  onActiveIndexChange,
  isDisabled = () => false,
}: Options) => {
  const [storedIndex, setActiveIndex] = useControllableState({
    value: activeIndexProp,
    defaultValue: defaultIndex,
    onChange: onActiveIndexChange,
  });
  const itemsRef = useRef(new Map<number, HTMLElement>());

  const activeIndex = Math.max(0, Math.min(storedIndex, count - 1));

  // Steps from `from` in `direction` to the nearest item that isn't
  // disabled, or returns undefined when there is none before the end.
  const findEnabled = (from: number, direction: number) => {
    for (let step = 1; step <= count; step += 1) {
      let index = from + direction * step;

      if (loop) {
        index = (index + count) % count;
      } else if (index < 0 || index >= count) {
        return undefined;
      }

      if (!isDisabled(index)) {
        return index;
      }
    }

    return undefined;
  };

  const getDirection = (event: KeyboardEvent<HTMLElement>) => {
    const isHorizontal = orientation !== 'vertical';
    const isVertical = orientation !== 'horizontal';
    const sign = isHorizontal && isRtl(event.currentTarget) ? -1 : 1;

    switch (event.key) {
      case 'ArrowLeft':
        return isHorizontal ? PREVIOUS * sign : undefined;
      case 'ArrowRight':
        return isHorizontal ? NEXT * sign : undefined;
      case 'ArrowUp':
        return isVertical ? PREVIOUS : undefined;
      case 'ArrowDown':
        return isVertical ? NEXT : undefined;
      default:
        return undefined;
    }
  };

  const moveTo = (index: number) => {
    const element = itemsRef.current.get(index);

    // Focusing the item reports it through its own `onFocus`.
    if (element) {
      element.focus();
    } else {
      setActiveIndex(index);
    }
  };

  const getItemProps = (index: number): ItemProps => ({
    tabIndex: index === activeIndex ? 0 : -1,
    onKeyDown: event => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      let target: number | undefined;

      if (event.key === 'Home') {
        target = findEnabled(-1, NEXT);
      } else if (event.key === 'End') {
        target = findEnabled(count, PREVIOUS);
      } else {
        const direction = getDirection(event);

        if (direction === undefined) {
          return;
        }

        target = findEnabled(index, direction);
      }

      // Handled keys don't scroll the page, even with nowhere to move.
      event.preventDefault();

      if (target !== undefined && target !== index) {
        moveTo(target);
      }
    },
    onFocus: () => {
      if (index !== activeIndex && !isDisabled(index)) {
        setActiveIndex(index);
      }
    },
    ref: element => {
      if (element) {
        itemsRef.current.set(index, element);
      } else {
        itemsRef.current.delete(index);
      }
    },
  });

  return { activeIndex, getItemProps };
};

export default useRovingFocus;
