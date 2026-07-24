import { useCallback, useRef } from 'react';

interface Options extends ScrollIntoViewOptions {
  offset?: number;
}
const useScrollToElements = (options?: Options) => {
  const elementRefs = useRef<(HTMLElement | null)[]>([]);

  const scrollToElement = useCallback(
    (index: number) => {
      const element = elementRefs.current[index];

      if (!element) {
        return;
      }

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'start',
        ...options,
      });

      if (options?.offset) {
        const top =
          element.getBoundingClientRect().top + window.scrollY - options.offset;

        window.scrollTo({
          top,
          behavior: options.behavior || 'smooth',
        });
      }
    },
    [options],
  );

  const setElementRef = useCallback(
    (element: HTMLElement | null, index: number) => {
      elementRefs.current[index] = element;
    },
    [],
  );

  return { elementRefs, setElementRef, scrollToElement };
};

export default useScrollToElements;
