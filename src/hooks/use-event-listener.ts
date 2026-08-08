import { type RefObject, useEffect, useRef } from 'react';

interface Options {
  capture?: boolean;
  passive?: boolean;
  once?: boolean;
  enabled?: boolean;
}

type EventListenerTarget = EventTarget | RefObject<EventTarget | null> | null;

function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: Options & { target?: Window | null },
): void;
function useEventListener<K extends keyof DocumentEventMap>(
  type: K,
  handler: (event: DocumentEventMap[K]) => void,
  options: Options & { target: Document | RefObject<Document | null> },
): void;
function useEventListener<
  T extends HTMLElement,
  K extends keyof HTMLElementEventMap,
>(
  type: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options: Options & { target: RefObject<T | null> },
): void;

// Resolves `target` (default `window`, or a raw EventTarget, or a
// RefObject pointing at one) and (de)registers `type` on it — the pair of
// addEventListener/removeEventListener calls duplicated across ui-kit
// (marquee item) and live-editor (error handlers). `handler` is read
// through a ref so a fresh function every render doesn't tear down and
// re-add the listener.
function useEventListener(
  type: string,
  handler: (event: Event) => void,
  options: Options & { target?: EventListenerTarget } = {},
) {
  const { target, capture, passive, once, enabled = true } = options;

  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const resolvedTarget =
      target && 'current' in target
        ? target.current
        : (target ?? (typeof window === 'undefined' ? null : window));

    if (!resolvedTarget) {
      return;
    }

    const listener = (event: Event) => {
      handlerRef.current(event);
    };

    resolvedTarget.addEventListener(type, listener, { capture, passive, once });

    return () => {
      resolvedTarget.removeEventListener(type, listener, { capture });
    };
  }, [type, target, capture, passive, once, enabled]);
}

export default useEventListener;
