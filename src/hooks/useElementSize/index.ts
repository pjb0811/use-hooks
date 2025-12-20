import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from 'react-use';

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

const useElementSize = <T extends HTMLElement>(delay: number = 200) => {
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
    delay,
    [size],
  );

  const updateSize = useCallback(() => {
    if (!elementRef.current) {
      return;
    }

    const { offsetWidth, offsetHeight } = elementRef.current;

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
  }, []);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!elementRef.current) {
      return;
    }

    if (observerRef.current) {
      observerRef.current.unobserve(elementRef.current);
    } else {
      observerRef.current = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          updateSize();
        });
      });
    }

    observerRef.current.observe(elementRef.current);
  }, [updateSize]);

  useEffect(() => {
    connect();

    const onResize = () => {
      updateSize();
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      disconnect();

      if (elementRef.current) {
        elementRef.current = null;
      }
    };
  }, [connect, disconnect, updateSize]);

  return { size: debouncedSize, breakpoint, elementRef };
};

export default useElementSize;
