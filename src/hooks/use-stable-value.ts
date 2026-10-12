import { useState } from 'react';

const isPlainObject = (value: object) => {
  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
};

// Same own keys, each value compared with `Object.is`, for plain objects and
// arrays. Anything else (a `Date`, a `Map`, a class instance) is compared by
// identity, since its own keys don't describe its contents. Never compares
// deeply: a nested object with a new identity counts as a change.
const shallowEqual = (a: unknown, b: unknown) => {
  if (Object.is(a, b)) {
    return true;
  }

  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }

  const isArray = Array.isArray(a);

  if (isArray !== Array.isArray(b)) {
    return false;
  }

  if (!isArray && !(isPlainObject(a) && isPlainObject(b))) {
    return false;
  }

  const keys = Object.keys(a);

  return (
    keys.length === Object.keys(b).length &&
    keys.every(
      key =>
        Object.hasOwn(b, key) &&
        Object.is(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key],
        ),
    )
  );
};

// Returns the previous reference while `isEqual(previous, value)` holds, and
// `value` otherwise, so an object or array prop passed inline keeps one
// identity until its contents change. `isEqual` defaults to a shallow
// comparison and is read from the current render.
//
// The kept value is adjusted during render, so a changed `value` is returned
// in the same render rather than one render late.
const useStableValue = <T>(
  value: T,
  isEqual: (previous: T, next: T) => boolean = shallowEqual,
): T => {
  // Wrapped in functions so a function `value` is stored, not called.
  const [stable, setStable] = useState(() => value);

  if (Object.is(stable, value) || isEqual(stable, value)) {
    return stable;
  }

  setStable(() => value);

  return value;
};

export default useStableValue;
