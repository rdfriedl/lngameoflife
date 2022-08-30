// copied from https://javascript.plainenglish.io/the-game-of-life-using-javascript-fc1aaec8274f

const rows = 100;
const cols = 100;
// Need 2D arrays. These are 1D
let currGen = [];
let nextGen = [];
// Creates two-dimensional arrays
for (let i = 0; i < rows; i++) {
  currGen[i] = new Array(cols).fill(0).map(() => Math.round(Math.random()));
  nextGen[i] = new Array(cols).fill(0);
}

function createNextGen() {
  for (let row in currGen) {
    for (let col in currGen[row]) {
      let neighbors = getNeighborCount(row, col);

      // Check the rules
      // If Alive
      if (currGen[row][col] == 1) {
        if (neighbors < 2) {
          nextGen[row][col] = 0;
        } else if (neighbors == 2 || neighbors == 3) {
          nextGen[row][col] = 1;
        } else if (neighbors > 3) {
          nextGen[row][col] = 0;
        }
      } else if (currGen[row][col] == 0) {
        // If Dead or Empty

        if (neighbors == 3) {
          // Propogate the species
          nextGen[row][col] = 1; // Birth?
        }
      }
    }
  }
}
function getNeighborCount(row, col) {
  let count = 0;
  let nrow = Number(row);
  let ncol = Number(col);

  // Make sure we are not at the first row
  if (nrow - 1 >= 0) {
    // Check top neighbor
    if (currGen[nrow - 1][ncol] == 1) count++;
  }
  // Make sure we are not in the first cell
  // Upper left corner
  if (nrow - 1 >= 0 && ncol - 1 >= 0) {
    //Check upper left neighbor
    if (currGen[nrow - 1][ncol - 1] == 1) count++;
  }
  // Make sure we are not on the first row last column
  // Upper right corner
  if (nrow - 1 >= 0 && ncol + 1 < cols) {
    //Check upper right neighbor
    if (currGen[nrow - 1][ncol + 1] == 1) count++;
  }
  // Make sure we are not on the first column
  if (ncol - 1 >= 0) {
    //Check left neighbor
    if (currGen[nrow][ncol - 1] == 1) count++;
  }
  // Make sure we are not on the last column
  if (ncol + 1 < cols) {
    //Check right neighbor
    if (currGen[nrow][ncol + 1] == 1) count++;
  }
  // Make sure we are not on the bottom left corner
  if (nrow + 1 < rows && ncol - 1 >= 0) {
    //Check bottom left neighbor
    if (currGen[nrow + 1][ncol - 1] == 1) count++;
  }
  // Make sure we are not on the bottom right
  if (nrow + 1 < rows && ncol + 1 < cols) {
    //Check bottom right neighbor
    if (currGen[nrow + 1][ncol + 1] == 1) count++;
  }

  // Make sure we are not on the last row
  if (nrow + 1 < rows) {
    //Check bottom neighbor
    if (currGen[nrow + 1][ncol] == 1) count++;
  }

  return count;
}

function updateCurrGen() {
  for (let row in currGen) {
    for (let col in currGen[row]) {
      // Update the current generation with
      // the results of createNextGen function
      currGen[row][col] = nextGen[row][col];
      // Set nextGen back to empty
      nextGen[row][col] = 0;
    }
  }
}

export function setCell(row, col, value = 0) {
  currGen[row][col] = value;
}

export function evolve() {
  createNextGen();
  updateCurrGen();
}

export function getCurrentGen() {
  return currGen;
}
