import { useCallback, useEffect, useRef, useState } from 'react';

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

const useElementSize = <T extends HTMLElement>() => {
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

  const elementRef = useRef<T>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const updateSize = useCallback(() => {
    if (elementRef.current) {
      const { offsetWidth, offsetHeight } = elementRef.current;
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      setSize({
        width: offsetWidth,
        height: offsetHeight,
      });
      setBreakpoint(getBreakpointInfo(offsetWidth + scrollBarWidth));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      if (elementRef.current) {
        observerRef.current.unobserve(elementRef.current);
      }
      observerRef.current.disconnect();
    }
  }, []);

  const connect = useCallback(() => {
    disconnect();

    observerRef.current = new ResizeObserver(updateSize);
    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }
    updateSize();
  }, [disconnect, updateSize]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { size, breakpoint, elementRef, connect, disconnect };
};

export default useElementSize;
