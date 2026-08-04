import { useCallback, useState } from 'react';

interface UseControllableStateProps<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}

// Backs a controlled/uncontrolled prop pair (`value`/`defaultValue`/
// `onChange`) with one hook: falls back to internal state whenever `value`
// is `undefined`, and always calls `onChange` regardless of which mode is
// active, so callers don't have to branch on it themselves.
const useControllableState = <T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateProps<T>): [T, (next: T) => void] => {
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(
    defaultValue,
  );

  const isControlled = value !== undefined;
  const currentValue = (isControlled ? value : uncontrolledValue) as T;

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
};

export default useControllableState;
