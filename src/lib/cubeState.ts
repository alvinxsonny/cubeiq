import Cube from 'cubejs';

export type FaceName = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';

export type CubeColor = 'white' | 'yellow' | 'green' | 'blue' | 'red' | 'orange';

export type CubeState = Record<FaceName, CubeColor[]>;

// Center stickers are fixed in standard orientation
export const DEFAULT_SOLVED_STATE: CubeState = {
  U: Array(9).fill('white'),
  R: Array(9).fill('red'),
  F: Array(9).fill('green'),
  D: Array(9).fill('yellow'),
  L: Array(9).fill('orange'),
  B: Array(9).fill('blue'),
};

// Maps FaceName to its color in the solved state
export const FACE_COLORS: Record<FaceName, CubeColor> = {
  U: 'white',
  D: 'yellow',
  L: 'orange',
  R: 'red',
  F: 'green',
  B: 'blue',
};

// Maps CubeColor to its face in the solved state
export const COLOR_TO_FACE: Record<CubeColor, FaceName> = {
  white: 'U',
  yellow: 'D',
  orange: 'L',
  red: 'R',
  green: 'F',
  blue: 'B',
};

// Convert standard CubeState to a 54-character Kociemba facelet string (U R F D L B)
export function cubeStateToFaceletString(state: CubeState): string {
  // First, identify what colors represent each face by looking at the centers (index 4)
  const centerColors: Record<FaceName, CubeColor> = {
    U: state.U[4],
    D: state.D[4],
    L: state.L[4],
    R: state.R[4],
    F: state.F[4],
    B: state.B[4],
  };

  // Build a reverse mapping from color to FaceName
  const colorToFaceNameMap: Record<string, FaceName> = {};
  (Object.keys(centerColors) as FaceName[]).forEach((face) => {
    colorToFaceNameMap[centerColors[face]] = face;
  });

  // Generate the facelet string by concatenating U, R, F, D, L, B faces
  const facesOrder: FaceName[] = ['U', 'R', 'F', 'D', 'L', 'B'];
  let faceletStr = '';

  for (const face of facesOrder) {
    const stickers = state[face];
    for (const color of stickers) {
      const faceSymbol = colorToFaceNameMap[color];
      if (!faceSymbol) {
        // If a center is duplicated, mapping might be incomplete. We use default mapping.
        faceletStr += COLOR_TO_FACE[color] || 'U';
      } else {
        faceletStr += faceSymbol;
      }
    }
  }

  return faceletStr;
}

// Convert a 54-character Kociemba facelet string back to a CubeState
export function faceletStringToCubeState(faceletStr: string): CubeState {
  const state: CubeState = {
    U: [],
    R: [],
    F: [],
    D: [],
    L: [],
    B: [],
  };

  const facesOrder: FaceName[] = ['U', 'R', 'F', 'D', 'L', 'B'];
  
  for (let i = 0; i < 6; i++) {
    const face = facesOrder[i];
    const segment = faceletStr.slice(i * 9, (i + 1) * 9);
    state[face] = Array.from(segment).map((char) => {
      // Map 'U' -> 'white', etc.
      switch (char) {
        case 'U': return 'white';
        case 'D': return 'yellow';
        case 'L': return 'orange';
        case 'R': return 'red';
        case 'F': return 'green';
        case 'B': return 'blue';
        default: return 'white';
      }
    });
  }

  return state;
}

function getPermutationParity(arr: number[]): number {
  let swaps = 0;
  const copy = [...arr];
  for (let i = 0; i < copy.length; i++) {
    for (let j = i + 1; j < copy.length; j++) {
      if (copy[i] > copy[j]) {
        swaps++;
      }
    }
  }
  return swaps % 2;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateCubeState(state: CubeState): ValidationResult {
  // 1. Check center pieces have unique colors
  const centers = [state.U[4], state.D[4], state.L[4], state.R[4], state.F[4], state.B[4]];
  const uniqueCenters = new Set(centers);
  if (uniqueCenters.size !== 6) {
    return {
      valid: false,
      reason: 'Center pieces must have 6 unique colors. Please check that every face center has a different color.',
    };
  }

  // 2. Count stickers of each color
  const allStickers = [
    ...state.U, ...state.D, ...state.L, ...state.R, ...state.F, ...state.B
  ];
  const colorCounts: Record<CubeColor, number> = {
    white: 0,
    yellow: 0,
    green: 0,
    blue: 0,
    red: 0,
    orange: 0,
  };
  allStickers.forEach((color) => {
    if (color in colorCounts) {
      colorCounts[color]++;
    }
  });

  const incorrectColors = Object.entries(colorCounts).filter(([_, count]) => count !== 9);
  if (incorrectColors.length > 0) {
    const details = incorrectColors.map(([color, count]) => `${color}: ${count}`).join(', ');
    return {
      valid: false,
      reason: `Sticker counts incorrect. Each color must have exactly 9 stickers. Found: ${details}`,
    };
  }

  // Convert to facelet string for further validation via cubejs
  const faceletStr = cubeStateToFaceletString(state);
  
  // 3. Roundtrip check (ensures corner and edge sticker combinations exist physically)
  let cube: any;
  try {
    cube = Cube.fromString(faceletStr);
  } catch (err) {
    return {
      valid: false,
      reason: 'An error occurred while reconstructing the cube state.',
    };
  }

  const roundtrip = cube.asString();
  if (roundtrip !== faceletStr) {
    return {
      valid: false,
      reason: 'Invalid corner or edge configurations detected. Rubik\'s Cubes cannot have these color combinations on individual pieces.',
    };
  }

  // 4. Corner orientation parity: sum must be 0 mod 3
  const coSum = (cube.co as number[]).reduce((a: number, b: number) => a + b, 0);
  if (coSum % 3 !== 0) {
    return {
      valid: false,
      reason: 'Twisted corner detected. The corner orientations do not match, making the cube unsolvable. Please correct the twisted corner.',
    };
  }

  // 5. Edge orientation parity: sum must be 0 mod 2
  const eoSum = (cube.eo as number[]).reduce((a: number, b: number) => a + b, 0);
  if (eoSum % 2 !== 0) {
    return {
      valid: false,
      reason: 'Flipped edge detected. One edge piece is flipped in an invalid orientation. Please check edge alignments.',
    };
  }

  // 6. Permutation parity: corner parity must equal edge parity
  const cpParity = getPermutationParity(cube.cp);
  const epParity = getPermutationParity(cube.ep);
  if (cpParity !== epParity) {
    return {
      valid: false,
      reason: 'Swapped pieces detected. Exactly two corners or two edges are swapped, which is impossible to solve. Please verify sticker locations.',
    };
  }

  return { valid: true };
}

// Applies a move to the CubeState and returns the next CubeState
export function applyMoveToState(state: CubeState, move: string): CubeState {
  const faceletStr = cubeStateToFaceletString(state);
  const cube = Cube.fromString(faceletStr);
  cube.move(move);
  return faceletStringToCubeState(cube.asString());
}

// Inverts a move sequence or a single move (e.g. R -> R', R' -> R, R2 -> R2)
export function invertMove(move: string): string {
  if (move.includes("'")) {
    return move.replace("'", "");
  } else if (move.includes("2")) {
    return move; // Double turn in reverse is the same double turn
  } else {
    return move + "'";
  }
}

