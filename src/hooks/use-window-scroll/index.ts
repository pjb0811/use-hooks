import { useEffect, useState } from 'react';

const useWindowScroll = () => {
  const [state, setState] = useState({
    x: 0,
    y: 0,
    percent: {
      x: 0,
      y: 0,
    },
  });

  useEffect(() => {
    const calculate = () => {
      const x = window.scrollX || 0;
      const y = window.scrollY || 0;

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const visualViewport = window.visualViewport;

      const viewportWidth =
        isIOS && visualViewport ? visualViewport.width : window.innerWidth;

      const viewportHeight =
        isIOS && visualViewport ? visualViewport.height : window.innerHeight;

      const maxScrollX = Math.max(
        0,
        document.documentElement.scrollWidth - viewportWidth,
      );
      const maxScrollY = Math.max(
        0,
        document.documentElement.scrollHeight - viewportHeight,
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

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onVisualViewportChange);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);

      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          'resize',
          onVisualViewportChange,
        );
      }
    };
  }, []);

  return state;
};

export default useWindowScroll;
