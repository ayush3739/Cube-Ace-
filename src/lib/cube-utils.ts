
type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';
type Color = 'W' | 'Y' | 'G' | 'B' | 'R' | 'O';

interface Cubie {
    U?: Color;
    D?: Color;
    L?: Color;
    R?: Color;
    F?: Color;
    B?: Color;
}

export type Cube = Cubie[];

export function getInitialCube(): Cube {
    const cube: Cube = Array(27).fill(null).map(() => ({}));
    
    // This logic ensures every visible face of each cubie gets a color.
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const index = (z + 1) * 9 + (y + 1) * 3 + (x + 1);
                if (x === 1) cube[index].R = 'R';   // Right face
                if (x === -1) cube[index].L = 'O';  // Left face
                if (y === 1) cube[index].U = 'W';   // Up face
                if (y === -1) cube[index].D = 'Y';  // Down face
                if (z === 1) cube[index].F = 'G';   // Front face
                if (z === -1) cube[index].B = 'B';  // Back face
            }
        }
    }
    return cube;
}

const movesList = ["U", "D", "R", "L", "F", "B"];
const modifiers = ["", "'", "2"];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateScramble(length: number = 20): string {
  const scramble: string[] = [];
  let lastMoveAxis: string | null = null;

  const axisMap: { [key: string]: string } = {
    U: 'y', D: 'y',
    R: 'x', L: 'x',
    F: 'z', B: 'z',
  };

  while (scramble.length < length) {
    let move = getRandomElement(movesList);
    const moveAxis = axisMap[move];

    if (moveAxis === lastMoveAxis) {
      continue;
    }
    
    if (scramble.length > 1) {
        const prevMove = scramble[scramble.length - 1].charAt(0);
        const prev2Move = scramble[scramble.length - 2].charAt(0);
        if (moveAxis === axisMap[prev2Move] && moveAxis === axisMap[move]) {
             continue;
        }
    }

    const modifier = getRandomElement(modifiers);
    scramble.push(move + modifier);
    lastMoveAxis = moveAxis;
  }

  return scramble.join(" ");
}

const faceIndices = {
    U: [18, 19, 20, 21, 22, 23, 24, 25, 26],
    D: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    F: [0, 1, 2, 9, 10, 11, 18, 19, 20],
    B: [6, 7, 8, 15, 16, 17, 24, 25, 26],
    R: [2, 5, 8, 11, 14, 17, 20, 23, 26],
    L: [0, 3, 6, 9, 12, 15, 18, 21, 24],
};

const stickerRotationMap: { [key in Face]: { [key in Face]?: Face } } = {
    U: { F: 'R', R: 'B', B: 'L', L: 'F' }, // For U turn
    D: { F: 'L', L: 'B', B: 'R', R: 'F' }, // For D turn
    F: { U: 'L', L: 'D', D: 'R', R: 'U' }, // For F turn
    B: { U: 'R', R: 'D', D: 'L', L: 'U' }, // For B turn
    R: { U: 'F', F: 'D', D: 'B', B: 'U' }, // For R turn
    L: { U: 'B', B: 'D', D: 'F', F: 'U' }, // For L turn
};


function rotateStickers(cubie: Cubie, face: Face): Cubie {
    const newCubie: Cubie = { ...cubie };
    const rotation = stickerRotationMap[face];
    for (const fromFace in rotation) {
        const toFace = rotation[fromFace as Face] as Face;
        newCubie[toFace] = cubie[fromFace as Face];
    }
    return newCubie;
}


function rotateFace(cube: Cube, face: Face, clockwise: boolean): Cube {
    const newCube = [...cube];
    const indices = faceIndices[face];
    const corners = [indices[0], indices[2], indices[8], indices[6]];
    const edges = [indices[1], indices[5], indices[7], indices[3]];

    const rotate = (arr: number[]) => {
        const rotatedCubies = arr.map(i => newCube[i]);
        const rotatedStickers = rotatedCubies.map(c => rotateStickers(c, face));
        if (clockwise) {
            newCube[arr[1]] = rotatedStickers[0];
            newCube[arr[2]] = rotatedStickers[1];
            newCube[arr[3]] = rotatedStickers[2];
            newCube[arr[0]] = rotatedStickers[3];
        } else {
            newCube[arr[3]] = rotatedStickers[0];
            newCube[arr[0]] = rotatedStickers[1];
            newCube[arr[1]] = rotatedStickers[2];
            newCube[arr[2]] = rotatedStickers[3];
        }
    };
    
    rotate(corners.map(i => indices.indexOf(i)).map(i => indices[i]));
    rotate(edges.map(i => indices.indexOf(i)).map(i => indices[i]));

    return newCube;
}

export function applyMove(cube: Cube, move: string): Cube {
    const face = move.charAt(0) as Face;
    const modifier = move.charAt(1);

    let newCube = [...cube];

    if (modifier === "'") {
        newCube = rotateFace(newCube, face, false);
    } else if (modifier === '2') {
        newCube = rotateFace(newCube, face, true);
        newCube = rotateFace(newCube, face, true);
    } else {
        newCube = rotateFace(newCube, face, true);
    }
    return newCube;
}
