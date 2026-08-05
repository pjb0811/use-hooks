import { type RefObject, useEffect, useState } from 'react';

// Pass a ref to an element rendered inside the window you actually want to
// track (e.g. a node portaled into an iframe). Without one, this defaults
// to the host `window`, which is wrong whenever the caller doesn't live in
// the top-level document. Resolved once per mount from `targetRef.current`.
const useWindowScroll = (targetRef?: RefObject<Element | null>) => {
  const [state, setState] = useState({
    x: 0,
    y: 0,
    percent: {
      x: 0,
      y: 0,
    },
  });

  useEffect(() => {
    const target = targetRef?.current?.ownerDocument.defaultView ?? window;
    const doc = target.document;

    const calculate = () => {
      const x = target.scrollX || 0;
      const y = target.scrollY || 0;

      const isIOS = /iPad|iPhone|iPod/.test(target.navigator.userAgent);
      const visualViewport = target.visualViewport;

      const viewportWidth =
        isIOS && visualViewport ? visualViewport.width : target.innerWidth;

      const viewportHeight =
        isIOS && visualViewport ? visualViewport.height : target.innerHeight;

      const maxScrollX = Math.max(
        0,
        doc.documentElement.scrollWidth - viewportWidth,
      );
      const maxScrollY = Math.max(
        0,
        doc.documentElement.scrollHeight - viewportHeight,
      );

      const percentX =
        maxScrollX === 0 ? 0 : Math.min(100, (x / maxScrollX) * 100);
      const percentY =
        maxScrollY === 0 ? 0 : Math.min(100, (y / maxScrollY) * 100);

      setState({
        x,
        y,
        percent: {
          x: Math.floor(Math.max(0, percentX)),
          y: Math.floor(Math.max(0, percentY)),
        },
      });
    };

    calculate();

    const onScroll = () => {
      calculate();
    };

    const onResize = () => {
      setTimeout(calculate, 100);
    };

    const onVisualViewportChange = () => {
      setTimeout(calculate, 50);
    };

    target.addEventListener('scroll', onScroll, { passive: true });
    target.addEventListener('resize', onResize);
    target.addEventListener('orientationchange', onResize);

    if (target.visualViewport) {
      target.visualViewport.addEventListener('resize', onVisualViewportChange);
    }

    return () => {
      target.removeEventListener('scroll', onScroll);
      target.removeEventListener('resize', onResize);
      target.removeEventListener('orientationchange', onResize);

      if (target.visualViewport) {
        target.visualViewport.removeEventListener(
          'resize',
          onVisualViewportChange,
        );
      }
    };
  }, [targetRef]);

  return state;
};

export default useWindowScroll;
