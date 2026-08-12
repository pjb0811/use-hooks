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

// Human-friendly spellings mapped to the actual `event.key` value, so
// callers can write `'space'` instead of a literal ' ' (whose trimmed form
// is empty and easy to lose) or `'esc'` for Escape.
const KEY_ALIASES: Record<string, string> = {
  space: ' ',
  spacebar: ' ',
  esc: 'escape',
};

// `mod` normalizes to the platform's usual "primary" modifier (Cmd on
// macOS, Ctrl elsewhere) so a single combo string covers both without the
// caller branching on platform themselves.
const parseCombo = (combo: string): ParsedCombo => {
  const parts = combo.split('+');
  const modifiers = parts.slice(0, -1).map(part => part.trim().toLowerCase());

  // The last segment is the key. Trim it like the modifiers so 'ctrl + z'
  // still resolves to 'z' — but if trimming would wipe a non-empty segment
  // entirely, the key *is* whitespace: the space key, whose event.key is ' '.
  const rawKey = parts[parts.length - 1] ?? '';
  const trimmedKey = rawKey.trim();
  let key = (
    trimmedKey === '' && rawKey !== '' ? rawKey : trimmedKey
  ).toLowerCase();

  // A bare '+' or a combo like 'ctrl++' splits to an empty final segment —
  // the '+' separator itself is the intended key.
  if (key === '' && parts.length > 1) {
    key = '+';
  }

  key = KEY_ALIASES[key] ?? key;

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

    let cancelled = false;
    let rafId: number | undefined;
    let resolvedTarget: EventTarget | null = null;

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

    const attach = () => {
      if (cancelled) {
        return;
      }

      // A RefObject target can still be null right after mount (conditional
      // render, portal, lazy mount) — retry every frame until it's
      // populated instead of giving up on the first effect run. The default
      // window and raw element/document targets have nothing to wait for.
      if (target && 'current' in target && !target.current) {
        rafId = requestAnimationFrame(attach);
        return;
      }

      resolvedTarget = resolveTarget(target);

      if (!resolvedTarget) {
        return;
      }

      resolvedTarget.addEventListener('keydown', onKeyDown);
    };

    attach();

    return () => {
      cancelled = true;
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
      }
      resolvedTarget?.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, comboKey, target, preventDefault, ignore]);
};

export default useKeyPress;
