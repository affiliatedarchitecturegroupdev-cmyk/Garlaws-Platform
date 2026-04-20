import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

interface StateManagerOptions<T> {
  initialState: T;
  onStateChange?: (newState: T, prevState: T) => void;
  cleanup?: (state: T) => void;
  memoize?: boolean;
}

export function useEfficientState<T extends Record<string, any>>(
  options: StateManagerOptions<T>
) {
  const { initialState, onStateChange, cleanup, memoize = true } = options;
  const [state, setState] = useState<T>(initialState);
  const prevStateRef = useRef<T>(initialState);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Memoized state updates
  const updateState = useCallback(
    (updater: Partial<T> | ((prevState: T) => Partial<T>)) => {
      setState((prev) => {
        const newPartial = typeof updater === 'function' ? updater(prev) : updater;
        const newState = { ...prev, ...newPartial };

        // Call onStateChange if provided
        onStateChange?.(newState, prev);

        // Store previous state
        prevStateRef.current = prev;

        return newState;
      });
    },
    [onStateChange]
  );

  // Memoized selectors to prevent unnecessary re-renders
  const select = useCallback(
    <K extends keyof T>(key: K): T[K] => state[key],
    [state]
  );

  const selectMultiple = useCallback(
    <K extends keyof T>(keys: K[]): Pick<T, K> => {
      const result = {} as Pick<T, K>;
      keys.forEach((key) => {
        result[key] = state[key];
      });
      return result;
    },
    [state]
  );

  // Memoized computed values
  const computed = useMemo(() => {
    if (!memoize) return {};

    return {
      // Add computed properties here based on your state structure
      // Example: isLoading: state.loadingStates.some(s => s),
    };
  }, [state, memoize]);

  // Batch updates for multiple state changes
  const batchUpdate = useCallback(
    (updates: Array<Partial<T> | ((prevState: T) => Partial<T>)>) => {
      setState((prev) => {
        let newState = { ...prev };

        updates.forEach((update) => {
          const partial = typeof update === 'function' ? update(newState) : update;
          newState = { ...newState, ...partial };
        });

        onStateChange?.(newState, prev);
        prevStateRef.current = prev;

        return newState;
      });
    },
    [onStateChange]
  );

  // Reset state to initial
  const reset = useCallback(() => {
    setState(initialState);
    prevStateRef.current = initialState;
  }, [initialState]);

  // Cleanup on unmount or when state changes
  useEffect(() => {
    if (cleanup && state !== prevStateRef.current) {
      // Cleanup previous state
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      // Set up cleanup for current state
      cleanupRef.current = () => cleanup(state);
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [state, cleanup]);

  return {
    state,
    prevState: prevStateRef.current,
    updateState,
    select,
    selectMultiple,
    computed,
    batchUpdate,
    reset,
  };
}

// Hook for managing component lifecycle with efficient re-renders
export function useComponentLifecycle() {
  const mountTimeRef = useRef<number>(Date.now());
  const renderCountRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(Date.now());

  renderCountRef.current += 1;
  lastRenderTimeRef.current = Date.now();

  const getMetrics = useCallback(() => ({
    mountTime: mountTimeRef.current,
    renderCount: renderCountRef.current,
    lastRenderTime: lastRenderTimeRef.current,
    uptime: Date.now() - mountTimeRef.current,
  }), []);

  const shouldUpdate = useCallback(
    (deps: React.DependencyList) => {
      // Simple memoization check - you can extend this
      return deps.some(dep => typeof dep === 'object' && dep !== null);
    },
    []
  );

  return {
    getMetrics,
    shouldUpdate,
  };
}