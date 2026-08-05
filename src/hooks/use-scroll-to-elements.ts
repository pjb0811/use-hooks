import { useCallback, useEffect, useRef } from 'react';

interface Options extends ScrollIntoViewOptions {
  offset?: number;
}

const useScrollToElements = (options?: Options) => {
  const elementRefs = useRef<(HTMLElement | null)[]>([]);
  // `options` is almost always an inline object literal at the call site,
  // so depending on it directly would recreate `scrollToElement` on every
  // render — read the latest value from a ref instead.
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  const scrollToElement = useCallback((index: number) => {
    const element = elementRefs.current[index];

    if (!element) {
      return;
    }

    const { offset, ...scrollIntoViewOptions } = optionsRef.current ?? {};

    // With an offset, `scrollIntoView` and `scrollTo` would both animate
    // the same scroll, fighting each other and settling in the wrong
    // place — use `scrollTo` alone, computed from the element's position
    // before any scrolling starts (not after `scrollIntoView`, where the
    // rect would reflect a mid-animation position).
    if (offset != null) {
      const top = element.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top,
        behavior: scrollIntoViewOptions.behavior || 'smooth',
      });
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'start',
      ...scrollIntoViewOptions,
    });
  }, []);

  const setElementRef = useCallback(
    (element: HTMLElement | null, index: number) => {
      elementRefs.current[index] = element;
    },
    [],
  );

  return { elementRefs, setElementRef, scrollToElement };
};

export default useScrollToElements;
