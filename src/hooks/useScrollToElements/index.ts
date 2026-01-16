import { useCallback, useRef } from 'react';

interface Options extends ScrollIntoViewOptions {
  offset?: number;
}
const useScrollToElements = (options?: Options) => {
  const elementRefs = useRef<HTMLElement[]>([]);

  const scrollToElement = useCallback(
    (index: number) => {
      if (elementRefs.current[index]) {
        elementRefs.current[index].scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'start',
          ...options,
        });

        if (options?.offset) {
          const top =
            elementRefs.current[index].getBoundingClientRect().top +
            window.scrollY -
            options.offset;

          window.scrollTo({
            top,
            behavior: options.behavior || 'smooth',
          });
        }
      }
    },
    [options],
  );

  const setElementRef = useCallback((element: HTMLElement, index: number) => {
    elementRefs.current[index] = element;
  }, []);

  return { elementRefs, setElementRef, scrollToElement };
};

export default useScrollToElements;
