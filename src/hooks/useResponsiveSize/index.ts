import { useEffect, useRef, useState } from 'react';

import useDebounce from '../useDebounce';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface BreakpointInfo {
  current: Breakpoint;
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  '2xl': boolean;
}

interface Options {
  delay?: number;
  container?: HTMLElement | null;
}

const BREAKPOINTS = {
  xs: 0, // < 640px
  sm: 640, // >= 640px
  md: 768, // >= 768px
  lg: 1024, // >= 1024px
  xl: 1280, // >= 1280px
  '2xl': 1536, // >= 1536px
} as const;

const getBreakpointInfo = (width: number): BreakpointInfo => {
  let current: Breakpoint = 'xs';

  if (width >= BREAKPOINTS['2xl']) {
    current = '2xl';
  } else if (width >= BREAKPOINTS.xl) {
    current = 'xl';
  } else if (width >= BREAKPOINTS.lg) {
    current = 'lg';
  } else if (width >= BREAKPOINTS.md) {
    current = 'md';
  } else if (width >= BREAKPOINTS.sm) {
    current = 'sm';
  } else {
    current = 'xs';
  }

  return {
    current,
    xs: width < BREAKPOINTS.sm,
    sm: width >= BREAKPOINTS.sm && width < BREAKPOINTS.md,
    md: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    lg: width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl,
    xl: width >= BREAKPOINTS.xl && width < BREAKPOINTS['2xl'],
    '2xl': width >= BREAKPOINTS['2xl'],
  };
};

const useElementSize = <T extends HTMLElement>(options?: Options) => {
  const { delay = 100, container } = options || {};
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [breakpoint, setBreakpoint] = useState<BreakpointInfo>({
    current: 'xs',
    xs: true,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
  });

  const [debouncedSize, setDebouncedSize] = useState({ width: 0, height: 0 });

  const elementRef = useRef<T>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  useDebounce(
    () => {
      setDebouncedSize(size);
    },
    { delay },
    [size],
  );

  useEffect(() => {
    const updateSize = () => {
      const target = container ?? elementRef.current ?? document.body;

      if (!target) {
        return;
      }

      const { offsetWidth, offsetHeight } = target;

      setSize(prev => {
        if (prev.width !== offsetWidth || prev.height !== offsetHeight) {
          return { width: offsetWidth, height: offsetHeight };
        }
        return prev;
      });

      setBreakpoint(prev => {
        const next = getBreakpointInfo(offsetWidth);
        if (prev.current !== next.current) {
          return next;
        }
        return prev;
      });
    };

    const connect = () => {
      const target = container ?? elementRef.current ?? document.body;

      if (!target) {
        return;
      }

      updateSize();

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          updateSize();
        });
      });

      observerRef.current.observe(target);
    };

    const disconnect = () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };

    connect();

    return () => {
      disconnect();
    };
  }, [container]);

  return {
    size: debouncedSize,
    breakpoint,
    ref: elementRef,
  };
};

export default useElementSize;
