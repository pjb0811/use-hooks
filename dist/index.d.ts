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

declare interface Props extends ScrollIntoViewOptions {
    offset?: number;
}

export declare const useElementRect: <T>(elementRef: ElementReference<T>) => DOMRect | null;

export declare const useElementSize: <T extends HTMLElement>() => {
    size: {
        width: number;
        height: number;
    };
    breakpoint: BreakpointInfo;
    elementRef: RefObject<T | null>;
    connect: () => void;
    disconnect: () => void;
};

export declare const useImageLoader: (src: string) => {
    loading: boolean;
    error: string | Event | undefined;
};

export declare function useLocalStorage<T>(key: string, initialValue: T): readonly [T, (value: T | ((val: T) => T)) => void];

export declare const useRecursiveTimeout: <T>(callback: () => Promise<T> | (() => void), delay: number | null) => void;

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

export { }
