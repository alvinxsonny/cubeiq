import Cube from 'cubejs';

let initialized = false;

self.onmessage = (event) => {
  const { type, payload } = event.data;

  if (type === 'INIT') {
    if (!initialized) {
      try {
        Cube.initSolver();
        initialized = true;
        self.postMessage({ type: 'INIT_DONE' });
      } catch (err: any) {
        self.postMessage({ type: 'INIT_ERROR', payload: err.message });
      }
    } else {
      self.postMessage({ type: 'INIT_DONE' });
    }
  } else if (type === 'SOLVE') {
    if (!initialized) {
      try {
        Cube.initSolver();
        initialized = true;
      } catch (err: any) {
        self.postMessage({ type: 'SOLVE_ERROR', payload: 'Failed to initialize solver: ' + err.message });
        return;
      }
    }
    try {
      const cube = Cube.fromString(payload);
      const solution = cube.solve();
      self.postMessage({ type: 'SOLVE_DONE', payload: solution });
    } catch (error: any) {
      self.postMessage({ type: 'SOLVE_ERROR', payload: error.message || 'Unknown solving error' });
    }
  }
};
