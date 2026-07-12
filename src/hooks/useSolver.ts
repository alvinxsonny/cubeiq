import { useEffect, useRef, useState } from 'react';

export interface SolverState {
  isReady: boolean;
  isSolving: boolean;
  error: string | null;
}

export function useSolver() {
  const [state, setState] = useState<SolverState>({
    isReady: false,
    isSolving: false,
    error: null,
  });

  const workerRef = useRef<Worker | null>(null);
  const solveResolverRef = useRef<((value: string) => void) | null>(null);
  const solveRejecterRef = useRef<((reason: any) => void) | null>(null);

  useEffect(() => {
    // Only run worker creation in the browser environment
    if (typeof window === 'undefined') return;

    const worker = new Worker(
      new URL('../workers/solver.worker.ts', import.meta.url)
    );
    workerRef.current = worker;

    worker.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === 'INIT_DONE') {
        setState((s) => ({ ...s, isReady: true, error: null }));
      } else if (type === 'INIT_ERROR') {
        setState((s) => ({ ...s, isReady: false, error: payload }));
      } else if (type === 'SOLVE_DONE') {
        setState((s) => ({ ...s, isSolving: false }));
        if (solveResolverRef.current) {
          solveResolverRef.current(payload);
          solveResolverRef.current = null;
          solveRejecterRef.current = null;
        }
      } else if (type === 'SOLVE_ERROR') {
        setState((s) => ({ ...s, isSolving: false, error: payload }));
        if (solveRejecterRef.current) {
          solveRejecterRef.current(new Error(payload));
          solveResolverRef.current = null;
          solveRejecterRef.current = null;
        }
      }
    };

    // Trigger initialization
    worker.postMessage({ type: 'INIT' });

    return () => {
      worker.terminate();
    };
  }, []);

  const solveCube = (faceletStr: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Solver Web Worker is not available'));
        return;
      }

      solveResolverRef.current = resolve;
      solveRejecterRef.current = reject;
      setState((s) => ({ ...s, isSolving: true, error: null }));
      workerRef.current.postMessage({ type: 'SOLVE', payload: faceletStr });
    });
  };

  return {
    isReady: state.isReady,
    isSolving: state.isSolving,
    error: state.error,
    solveCube,
  };
}
