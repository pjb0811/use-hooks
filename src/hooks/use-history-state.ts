import { useCallback, useReducer } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

type Action<T> =
  | { type: 'SET'; value: T | ((prev: T) => T) }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET'; value: T };

const createReducer =
  <T>(limit: number) =>
  (state: HistoryState<T>, action: Action<T>): HistoryState<T> => {
    switch (action.type) {
      case 'SET': {
        const resolved =
          action.value instanceof Function
            ? action.value(state.present)
            : action.value;

        if (resolved === state.present) {
          return state;
        }

        return {
          past: [...state.past, state.present].slice(-limit),
          present: resolved,
          future: [],
        };
      }

      case 'UNDO': {
        if (state.past.length === 0) {
          return state;
        }

        const previous = state.past[state.past.length - 1] as T;

        return {
          past: state.past.slice(0, -1),
          present: previous,
          future: [state.present, ...state.future],
        };
      }

      case 'REDO': {
        if (state.future.length === 0) {
          return state;
        }

        const [next, ...rest] = state.future;

        return {
          past: [...state.past, state.present].slice(-limit),
          present: next as T,
          future: rest,
        };
      }

      case 'RESET': {
        return { past: [], present: action.value, future: [] };
      }

      default: {
        return state;
      }
    }
  };

interface UseHistoryStateOptions {
  limit?: number;
}

const DEFAULT_LIMIT = 50;

const useHistoryState = <T>(
  initialValue: T,
  options?: UseHistoryStateOptions,
) => {
  const limit = options?.limit ?? DEFAULT_LIMIT;

  const [state, dispatch] = useReducer(createReducer<T>(limit), {
    past: [],
    present: initialValue,
    future: [],
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    dispatch({ type: 'SET', value });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const reset = useCallback((value: T) => {
    dispatch({ type: 'RESET', value });
  }, []);

  return {
    value: state.present,
    setValue,
    undo,
    redo,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  } as const;
};

export default useHistoryState;
