import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import useDebouncedCallback from './use-debounced-callback';

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
  // Measure the viewport (window.innerWidth/innerHeight) instead of an
  // element/document.body. Useful when no `container`/ref is attached and
  // the breakpoint should reflect the viewport rather than document.body's
  // box, which can diverge from it if body has margin/transform.
  viewport?: boolean;
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

const breakpointEqual = (a: BreakpointInfo, b: BreakpointInfo) =>
  a.current === b.current &&
  a.xs === b.xs &&
  a.sm === b.sm &&
  a.md === b.md &&
  a.lg === b.lg &&
  a.xl === b.xl &&
  a['2xl'] === b['2xl'];

const measureTarget = (target: HTMLElement) => ({
  width: target.offsetWidth,
  height: target.offsetHeight,
});

const measureViewport = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const useResponsiveSize = <T extends HTMLElement>(options?: Options) => {
  const { delay = 100, container, viewport = false } = options || {};

  const [element, setElement] = useState<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [breakpoint, setBreakpoint] = useState<BreakpointInfo>(() =>
    getBreakpointInfo(0),
  );

  const observerRef = useRef<ResizeObserver | null>(null);
  const latestRef = useRef({ width: 0, height: 0 });
  const committedRef = useRef({ width: 0, height: 0 });

  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  // `size` and `breakpoint` are always committed together here, so
  // consumers never observe one reflecting a newer measurement than the
  // other.
  const commit = useCallback(() => {
    const next = latestRef.current;

    if (
      committedRef.current.width === next.width &&
      committedRef.current.height === next.height
    ) {
      return;
    }

    committedRef.current = next;
    setSize(next);

    const nextBreakpoint = getBreakpointInfo(next.width);
    setBreakpoint(prev =>
      breakpointEqual(prev, nextBreakpoint) ? prev : nextBreakpoint,
    );
  }, []);

  // Manual invocation only (`autoInvoke: false`) — reuses
  // useDebouncedCallback's machinery instead of duplicating it here.
  const debouncedCommit = useDebouncedCallback(commit, {
    delay,
    autoInvoke: false,
  });

  // Measure synchronously before paint so the very first render reflects
  // the real size/breakpoint instead of the `{0,0}`/`xs` placeholder —
  // only later updates (from the observer/listener below) go through the
  // debounced path.
  useLayoutEffect(() => {
    const measured = viewport
      ? measureViewport()
      : (() => {
          const target = container ?? element ?? document.body;
          return target ? measureTarget(target) : null;
        })();

    if (!measured) {
      return;
    }

    latestRef.current = measured;
    commit();
  }, [container, element, viewport, commit]);

  useEffect(() => {
    if (viewport) {
      const onResize = () => {
        latestRef.current = measureViewport();
        debouncedCommit();
      };

      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }

    const target = container ?? element ?? document.body;

    if (!target) {
      return;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        latestRef.current = measureTarget(target);
        debouncedCommit();
      });
    });

    observerRef.current.observe(target);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [container, element, viewport, debouncedCommit]);

  return {
    size,
    breakpoint,
    ref,
  };
};

export default useResponsiveSize;
