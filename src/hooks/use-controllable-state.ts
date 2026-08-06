import { useCallback, useEffect, useRef, useState } from 'react';

interface UseControllableStateProps<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}

// Backs a controlled/uncontrolled prop pair (`value`/`defaultValue`/
// `onChange`) with one hook: falls back to internal state whenever `value`
// is `undefined`, and always calls `onChange` regardless of which mode is
// active, so callers don't have to branch on it themselves.
//
// `value === undefined` is what marks a render as uncontrolled, so it can't
// also be used as a real, controlled value of `undefined` — that's an
// inherent limitation of this "sentinel" style of controlled-state
// detection (shared by most hooks of this shape, including Radix's own),
// not something fixable without a different API (e.g. an explicit
// `controlled` boolean prop instead of inferring it from `value`).
function useControllableState<T>(
  props: UseControllableStateProps<T> & { defaultValue: T },
): [T, (next: T) => void];
function useControllableState<T>(
  props: UseControllableStateProps<T>,
): [T | undefined, (next: T) => void];
function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateProps<T>) {
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(
    defaultValue,
  );

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const wasControlledRef = useRef(isControlled);

  useEffect(() => {
    // Read `process.env.NODE_ENV` through `globalThis` rather than the
    // bare `process` global — this hook ships as plain ESM and can end up
    // somewhere with no bundler define for it (or no `process` at all, and
    // no @types/node in scope to even name it), where referencing it
    // directly would fail instead of just missing a warning.
    const nodeEnv = (
      globalThis as { process?: { env?: { NODE_ENV?: string } } }
    ).process?.env?.NODE_ENV;
    const isProduction = nodeEnv === 'production';

    if (!isProduction && wasControlledRef.current !== isControlled) {
      console.warn(
        `useControllableState is changing from ${
          wasControlledRef.current ? 'controlled' : 'uncontrolled'
        } to ${
          isControlled ? 'controlled' : 'uncontrolled'
        }. A component should not switch between controlled and uncontrolled — decide on one and stick with it (e.g. by always passing a non-undefined \`value\`, or never passing one).`,
      );
    }
    wasControlledRef.current = isControlled;
  }, [isControlled]);

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [currentValue, setValue];
}

export default useControllableState;
