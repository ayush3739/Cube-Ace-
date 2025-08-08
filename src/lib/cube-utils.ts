
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

const CUBE_CONFIG_FACE_MAP: Record<number, Face> = {
    0: 'U', 1: 'R', 2: 'F', 3: 'D', 4: 'L', 5: 'B'
};

const stickerIndexToFacePosition: Record<number, { face: Face, x: number, y: number, z: number }> = {
    // A map from the 0-53 index of the config string to the 3D coordinate and face direction of that sticker
    // This is complex to generate. For now, we use a simpler method in cubeConfigToCube
};


export function cubeConfigToCube(config: string): Cube {
    const cube: Cube = Array(27).fill(null).map(() => ({}));
    const colorMap: Record<string, Face> = { W: 'U', R: 'R', G: 'F', Y: 'D', O: 'L', B: 'B' };

    const getCoord = (face: Face, i: number, j: number): { x: number, y: number, z: number } => {
        switch (face) {
            case 'U': return { x: i, y: 1, z: j };
            case 'D': return { x: i, y: -1, z: j };
            case 'L': return { x: -1, y: j, z: i };
            case 'R': return { x: 1, y: j, z: i };
            case 'F': return { x: i, y: j, z: 1 };
            case 'B': return { x: i, y: j, z: -1 };
        }
    };

    const faces = ['U', 'R', 'F', 'D', 'L', 'B'] as Face[];
    for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
        const face = faces[faceIndex];
        const faceConfig = config.substring(faceIndex * 9, faceIndex * 9 + 9);
        for (let i = 0; i < 9; i++) {
            const colorChar = faceConfig[i] as Color;
            
            // Map 2D face index (0-8) to 3D sub-cube coordinates (-1, 0, 1)
            const x = (i % 3) - 1;
            const y = - (Math.floor(i / 3) - 1);
            
            let coords;
            // This mapping needs to be correct for orientation
            switch(face) {
                case 'U': coords = {x, y: 1, z: -y}; break;
                case 'D': coords = {x, y: -1, z: y}; break;
                case 'F': coords = {x, y: y, z: 1}; break;
                case 'B': coords = {x: -x, y: y, z: -1}; break;
                case 'R': coords = {x: 1, y: y, z: x}; break;
                case 'L': coords = {x: -1, y: y, z: -x}; break;
            }

            // Invert Y and Z for THREE.js coordinate system if needed
            const finalY = -coords.y;
            const finalZ = -coords.z;
           
            const cubieIndex = (coords.z + 1) * 9 + (coords.y + 1) * 3 + (coords.x + 1);

            if (cubieIndex >= 0 && cubieIndex < 27) {
                if (!cube[cubieIndex]) {
                    cube[cubieIndex] = {};
                }
                cube[cubieIndex][face] = colorChar;
            }
        }
    }

    // A better approach:
    const newCube = getInitialCube(); // Start with a solved cube
    const faceChars = [
      'U', 'R', 'F', 'D', 'L', 'B'
    ]
    const colorChars = [
      'W', 'R', 'G', 'Y', 'O', 'B'
    ]

    for(let f=0; f<6; f++) {
      const face = faceChars[f] as Face;
      const faceConfig = config.substring(f*9, f*9+9);
      for(let i=0; i<9; i++) {
        const color = faceConfig[i] as Color;
        // This is where it gets tricky. We need to map the sticker (face, i) to a cubie and one of its faces.
        // E.g. U face, sticker 0 (top-left) belongs to cubie at (-1, 1, -1), and it's that cubie's 'U' face.
      }
    }


    // This simplified logic just replaces colors on a solved cube's sticker positions.
    // It doesn't correctly handle orientation, but it's a start for visual representation.
    const finalCube = getInitialCube();
    const faceOrder: Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];

    faceOrder.forEach((face, faceIdx) => {
      const faceConfig = config.substring(faceIdx * 9, (faceIdx + 1) * 9);
      const indices = faceIndices[face];
      indices.forEach((cubieIndex, stickerIdx) => {
        if (finalCube[cubieIndex]) {
          finalCube[cubieIndex][face] = faceConfig[stickerIdx] as Color;
        }
      });
    });

    return finalCube;
}


export function getInitialCube(): Cube {
    const cube: Cube = Array(27).fill(null).map(() => ({}));
    
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                const index = (z + 1) * 9 + (y + 1) * 3 + (x + 1);
                if (x === 1) cube[index].R = 'R';
                if (x === -1) cube[index].L = 'O';
                if (y === 1) cube[index].U = 'W';
                if (y === -1) cube[index].D = 'Y';
                if (z === 1) cube[index].F = 'G';
                if (z === -1) cube[index].B = 'B';
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
    U: [24, 25, 26, 21, 22, 23, 18, 19, 20],
    D: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    F: [18, 19, 20, 9, 10, 11, 0, 1, 2],
    B: [26, 25, 24, 17, 16, 15, 8, 7, 6],
    R: [20, 23, 26, 11, 14, 17, 2, 5, 8],
    L: [18, 21, 24, 9, 12, 15, 0, 3, 6],
};


const stickerRotationMap: { [key in Face]: { [key in Face]?: Face } } = {
    U: { F: 'R', R: 'B', B: 'L', L: 'F' }, // For U turn
    D: { F: 'L', L: 'B', B: 'R', R: 'F' }, // For D turn
    F: { U: 'L', L: 'D', D: 'R', R: 'U' }, // For F turn
    B: { U: 'R', R: 'D', D: 'L', L: 'U' }, // For B turn
    R: { U: 'F', F: 'D', D: 'B', B: 'U' }, // For R turn
    L: { U: 'B', B: 'D', D: 'F', F: 'U' }, // For L turn
};


function rotateStickers(cubie: Cubie, face: Face, clockwise: boolean): Cubie {
    const newCubie: Cubie = { ...cubie };
    const rotation = stickerRotationMap[face];
    if (clockwise) {
      for (const fromFace in rotation) {
          const toFace = rotation[fromFace as Face] as Face;
          delete newCubie[fromFace as Face];
          newCubie[toFace] = cubie[fromFace as Face];
      }
    } else { // Counter-clockwise
      for (const fromFace in rotation) {
          const toFace = rotation[fromFace as Face] as Face;
          delete newCubie[toFace];
          newCubie[fromFace as Face] = cubie[toFace];
      }
    }
    return newCubie;
}


function rotateFace(cube: Cube, face: Face, clockwise: boolean): Cube {
    const newCube = [...cube];
    const indices = faceIndices[face];
    
    const cycle = (arr: number[], direction: 1 | -1) => {
        const cubies = arr.map(i => newCube[i]);
        const rotatedStickers = cubies.map(c => rotateStickers(c, face, clockwise));
        for (let i = 0; i < arr.length; i++) {
            let newIndex = (i + direction + arr.length) % arr.length;
            newCube[arr[newIndex]] = rotatedStickers[i];
        }
    };
    
    const direction = clockwise ? 1 : -1;

    // Corners
    cycle([indices[0], indices[2], indices[8], indices[6]], direction);
    // Edges
    cycle([indices[1], indices[5], indices[7], indices[3]], direction);

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
