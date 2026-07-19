import { type RefObject, useEffect, useState } from 'react';

type ElementReference<T> = string | RefObject<T>;

const useElementPosition = <T>(elementRef: ElementReference<T>) => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const getElement = (ref: ElementReference<T>): T | null => {
      if (typeof ref === 'string') {
        return document.querySelector(ref) as T;
      }
      return ref.current;
    };

    const updateRect = () => {
      const element = getElement(elementRef) as HTMLElement | null;
      if (element) {
        setRect(element.getBoundingClientRect());
      } else {
        setRect(null);
      }
    };

    const onUpdate = () => {
      requestAnimationFrame(updateRect);
    };

    updateRect();

    window.addEventListener('scroll', onUpdate, { passive: true });
    window.addEventListener('resize', onUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', onUpdate);
      window.removeEventListener('resize', onUpdate);
    };
  }, [elementRef]);

  return rect;
};

export default useElementPosition;
