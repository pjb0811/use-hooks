import { RefObject } from 'react';

declare type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

declare interface BreakpointInfo {
  current: Breakpoint;
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  '2xl': boolean;
}

declare type ElementReference<T> = string | RefObject<T>;

declare interface Options {
  enabled?: boolean;
  useWheel?: boolean;
  debounceDelay?: number;
  threshold?: number;
}

declare interface Props extends ScrollIntoViewOptions {
  offset?: number;
}

export declare const useBodyScrollLock: (enabled?: boolean) => void;

export declare const useElementRect: <T>(
  elementRef: ElementReference<T>,
) => DOMRect | null;

export declare const useElementSize: <T extends HTMLElement>(
  delay?: number,
) => {
  size: {
    width: number;
    height: number;
  };
  breakpoint: BreakpointInfo;
  ref: RefObject<T | null>;
};

export declare const useImageLoader: (src: string) => {
  loading: boolean;
  error: string | Event | undefined;
};

export declare function useLocalStorage<T>(
  key: string,
  initialValue: T,
): readonly [T, (value: T | ((val: T) => T)) => void];

export declare const useRecursiveTimeout: <T>(
  callback: () => Promise<T> | (() => void),
  delay: number | null,
) => void;

export declare const useScrollBounceBack: (options?: Options) => void;

export declare const useScrollPosition: () => {
  element: HTMLElement | null;
  setRef: (el: HTMLElement | null) => void;
  scrollY: number;
  scrollPercentage: number;
  isAtTop: boolean;
  isAtBottom: boolean;
  scrollableHeight: number;
  clientHeight: number;
  scrollHeight: number;
};

export declare function useScrollToElements(options?: Props): {
  elementRefs: RefObject<HTMLElement[]>;
  setElementRef: (element: HTMLElement, index: number) => void;
  scrollToElement: (index: number) => void;
};

export declare const useViewport: (
  options?: UseViewportOptions,
) => ViewportInfo;

declare interface UseViewportOptions {
  isInApp?: boolean;
  debounce?: number;
}

export declare const useWindowScroll: () => {
  x: number;
  y: number;
  percent: {
    x: number;
    y: number;
  };
};

declare type ViewportInfo =
  | VisualViewport
  | {
      width: number;
      height: number;
      offsetLeft: number;
      offsetTop: number;
      pageLeft: number;
      pageTop: number;
      scale: number;
    };

export {};
