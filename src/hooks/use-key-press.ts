import { type RefObject, useEffect, useRef } from 'react';

type KeyPressTarget =
  | RefObject<HTMLElement | null>
  | Window
  | Document
  | HTMLElement
  | null
  | undefined;

interface Options {
  target?: KeyPressTarget;
  enabled?: boolean;
  preventDefault?: boolean;
  // CSS selector — a keydown whose target is inside a matching element is
  // ignored (e.g. don't hijack Cmd+Z while the user is typing in a code
  // editor that has its own undo).
  ignore?: string;
}

interface ParsedCombo {
  key: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
}

const isMac = () =>
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

// `mod` normalizes to the platform's usual "primary" modifier (Cmd on
// macOS, Ctrl elsewhere) so a single combo string covers both without the
// caller branching on platform themselves.
const parseCombo = (combo: string): ParsedCombo => {
  const parts = combo.split('+').map(part => part.trim().toLowerCase());
  const key = parts[parts.length - 1] ?? '';
  const modifiers = parts.slice(0, -1);

  let ctrl = modifiers.includes('ctrl');
  let meta = modifiers.includes('meta') || modifiers.includes('cmd');
  const shift = modifiers.includes('shift');
  const alt = modifiers.includes('alt') || modifiers.includes('option');

  if (modifiers.includes('mod')) {
    if (isMac()) {
      meta = true;
    } else {
      ctrl = true;
    }
  }

  return { key, ctrl, meta, shift, alt };
};

// Modifiers not named in the combo are required to be *absent*, not just
// ignored — otherwise 'mod+z' and 'mod+shift+z' registered as separate
// bindings (the exact motivating case for this hook) would both fire on
// the same Cmd+Shift+Z keypress instead of only the latter.
const matchesCombo = (event: KeyboardEvent, combo: ParsedCombo) =>
  event.key.toLowerCase() === combo.key &&
  event.ctrlKey === combo.ctrl &&
  event.metaKey === combo.meta &&
  event.shiftKey === combo.shift &&
  event.altKey === combo.alt;

const resolveTarget = (target: KeyPressTarget): EventTarget | null => {
  if (!target) {
    return typeof window === 'undefined' ? null : window;
  }
  return 'current' in target ? target.current : target;
};

const useKeyPress = (
  combo: string | string[],
  handler: (event: KeyboardEvent) => void,
  options: Options = {},
) => {
  const { target, enabled = true, preventDefault = false, ignore } = options;

  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  const combos = Array.isArray(combo) ? combo : [combo];
  const parsedCombos = combos.map(parseCombo);
  // `combos` is typically a fresh array literal at the call site — depend
  // on a stable string proxy instead so this doesn't tear down and
  // re-register the listener on every render. `target` itself (a
  // RefObject, or window/document/an element variable) is normally
  // already stable across renders, so it's used directly below.
  const comboKey = combos.join(',');

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const resolvedTarget = resolveTarget(target);

    if (!resolvedTarget) {
      return;
    }

    const onKeyDown = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      const eventTarget = keyboardEvent.target as HTMLElement | null;

      if (ignore && eventTarget?.closest(ignore)) {
        return;
      }

      if (!parsedCombos.some(parsed => matchesCombo(keyboardEvent, parsed))) {
        return;
      }

      if (preventDefault) {
        keyboardEvent.preventDefault();
      }

      handlerRef.current(keyboardEvent);
    };

    resolvedTarget.addEventListener('keydown', onKeyDown);

    return () => {
      resolvedTarget.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, comboKey, target, preventDefault, ignore]);
};

export default useKeyPress;
