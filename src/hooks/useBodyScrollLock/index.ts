import { useEffect } from 'react';

const useBodyScrollLock = (enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const scrollY = window.scrollY;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    const originalStyles = {
      documentElement: {
        overflow: document.documentElement.style.overflow,
        height: document.documentElement.style.height,
        position: document.documentElement.style.position,
        width: document.documentElement.style.width,
      },
      body: {
        overflow: document.body.style.overflow,
        height: document.body.style.height,
        position: document.body.style.position,
        top: document.body.style.top,
        left: document.body.style.left,
        right: document.body.style.right,
        width: document.body.style.width,
        webkitOverflowScrolling: document.body.style.getPropertyValue(
          '-webkit-overflow-scrolling',
        ),
      },
    };

    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.width = '100%';

    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';

    if (isIOS) {
      document.body.style.setProperty('-webkit-overflow-scrolling', 'touch');

      const preventAll = (e: Event) => {
        if (
          e.target === document.body ||
          e.target === document.documentElement ||
          e.target === window
        ) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      };

      const preventScroll = () => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      };

      const events = ['scroll', 'touchmove', 'touchstart', 'touchend'];
      events.forEach(event => {
        window.addEventListener(event, preventAll, {
          passive: false,
          capture: true,
        });
        document.addEventListener(event, preventAll, {
          passive: false,
          capture: true,
        });
        document.body.addEventListener(event, preventAll, {
          passive: false,
          capture: true,
        });
      });

      const scrollInterval = setInterval(preventScroll, 16);

      return () => {
        clearInterval(scrollInterval);
        events.forEach(event => {
          window.removeEventListener(event, preventAll, { capture: true });
          document.removeEventListener(event, preventAll, { capture: true });
          document.body.removeEventListener(event, preventAll, {
            capture: true,
          });
        });

        document.documentElement.style.overflow =
          originalStyles.documentElement.overflow;
        document.documentElement.style.height =
          originalStyles.documentElement.height;
        document.documentElement.style.position =
          originalStyles.documentElement.position;
        document.documentElement.style.width =
          originalStyles.documentElement.width;

        document.body.style.overflow = originalStyles.body.overflow;
        document.body.style.height = originalStyles.body.height;
        document.body.style.position = originalStyles.body.position;
        document.body.style.top = originalStyles.body.top;
        document.body.style.left = originalStyles.body.left;
        document.body.style.right = originalStyles.body.right;
        document.body.style.width = originalStyles.body.width;

        if (originalStyles.body.webkitOverflowScrolling) {
          document.body.style.setProperty(
            '-webkit-overflow-scrolling',
            originalStyles.body.webkitOverflowScrolling,
          );
        } else {
          document.body.style.removeProperty('-webkit-overflow-scrolling');
        }

        window.scrollTo(0, scrollY);
      };
    }

    return () => {
      document.documentElement.style.overflow =
        originalStyles.documentElement.overflow;
      document.documentElement.style.height =
        originalStyles.documentElement.height;
      document.documentElement.style.position =
        originalStyles.documentElement.position;
      document.documentElement.style.width =
        originalStyles.documentElement.width;

      document.body.style.overflow = originalStyles.body.overflow;
      document.body.style.height = originalStyles.body.height;
      document.body.style.position = originalStyles.body.position;
      document.body.style.top = originalStyles.body.top;
      document.body.style.left = originalStyles.body.left;
      document.body.style.right = originalStyles.body.right;
      document.body.style.width = originalStyles.body.width;

      window.scrollTo(0, scrollY);
    };
  }, [enabled]);
};

export default useBodyScrollLock;
