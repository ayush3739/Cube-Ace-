const moves = ["U", "D", "R", "L", "F", "B"];
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
    let move = getRandomElement(moves);
    const moveAxis = axisMap[move];

    // Ensure we don't move the same axis twice in a row (e.g., R L)
    if (moveAxis === lastMoveAxis) {
      continue;
    }
    
    // Optional: prevent moves like U D U by checking two moves back
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
