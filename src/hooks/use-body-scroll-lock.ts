import { useEffect } from 'react';

interface LockedStyles {
  documentElement: {
    overflow: string;
    height: string;
    position: string;
    width: string;
  };
  body: {
    overflow: string;
    height: string;
    position: string;
    top: string;
    left: string;
    right: string;
    width: string;
    paddingRight: string;
    webkitOverflowScrolling: string;
  };
}

// A Set of per-instance tokens instead of a raw counter — deleting the same
// token twice (or locking with a token that's already in the set) can't
// drift the count the way increment/decrement pairs could.
const activeLocks = new Set<symbol>();
let originalStyles: LockedStyles | null = null;
let originalScrollY = 0;

const isIOS = () =>
  typeof navigator !== 'undefined' &&
  /iPad|iPhone|iPod/.test(navigator.userAgent);

const lockScroll = (token: symbol) => {
  if (activeLocks.size === 0) {
    originalScrollY = window.scrollY;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const currentPaddingRight =
      parseFloat(getComputedStyle(document.body).paddingRight) || 0;

    originalStyles = {
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
        paddingRight: document.body.style.paddingRight,
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
    document.body.style.top = `-${originalScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }

    if (isIOS()) {
      document.body.style.setProperty('-webkit-overflow-scrolling', 'touch');
    }
  }

  activeLocks.add(token);
};

const unlockScroll = (token: symbol) => {
  activeLocks.delete(token);

  if (activeLocks.size > 0 || !originalStyles) {
    return;
  }

  document.documentElement.style.overflow =
    originalStyles.documentElement.overflow;
  document.documentElement.style.height = originalStyles.documentElement.height;
  document.documentElement.style.position =
    originalStyles.documentElement.position;
  document.documentElement.style.width = originalStyles.documentElement.width;

  document.body.style.overflow = originalStyles.body.overflow;
  document.body.style.height = originalStyles.body.height;
  document.body.style.position = originalStyles.body.position;
  document.body.style.top = originalStyles.body.top;
  document.body.style.left = originalStyles.body.left;
  document.body.style.right = originalStyles.body.right;
  document.body.style.width = originalStyles.body.width;
  document.body.style.paddingRight = originalStyles.body.paddingRight;

  if (originalStyles.body.webkitOverflowScrolling) {
    document.body.style.setProperty(
      '-webkit-overflow-scrolling',
      originalStyles.body.webkitOverflowScrolling,
    );
  } else {
    document.body.style.removeProperty('-webkit-overflow-scrolling');
  }

  window.scrollTo(0, originalScrollY);
  originalStyles = null;
};

const useBodyScrollLock = (enabled: boolean = true) => {
  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) {
      return;
    }

    const token = Symbol('body-scroll-lock');
    lockScroll(token);

    // The position:fixed styles above are the real lock — this is only a
    // narrow safety net for iOS Safari, which can still rubber-band the
    // page on a touchmove that starts directly on the body/html background.
    // Only that one event is handled (no capture, no stopPropagation), so
    // a scrollable element inside the locked content (e.g. a modal body)
    // keeps scrolling normally — its touchmove target isn't body/html.
    let removeTouchListener: (() => void) | undefined;

    if (isIOS()) {
      const preventTouchMove = (event: TouchEvent) => {
        if (
          event.target === document.body ||
          event.target === document.documentElement
        ) {
          event.preventDefault();
        }
      };

      document.addEventListener('touchmove', preventTouchMove, {
        passive: false,
      });

      removeTouchListener = () => {
        document.removeEventListener('touchmove', preventTouchMove);
      };
    }

    return () => {
      removeTouchListener?.();
      unlockScroll(token);
    };
  }, [enabled]);
};

export default useBodyScrollLock;
