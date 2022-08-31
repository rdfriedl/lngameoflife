import { CellMap } from "./cell-map.js";

function getNeighborCount(map, x, y) {
  let count = 0;

  // Make sure we are not at the first row
  if (y - 1 >= 0) {
    // Check top neighbor
    if (map.getCell(x, y - 1)) count++;
  }
  // Make sure we are not in the first cell
  // Upper left corner
  if (y - 1 >= 0 && x - 1 >= 0) {
    //Check upper left neighbor
    if (map.getCell(x - 1, y - 1)) count++;
  }
  // Make sure we are not on the first row last column
  // Upper right corner
  if (y - 1 >= 0 && x + 1 < map.width) {
    //Check upper right neighbor
    if (map.getCell(x + 1, y - 1)) count++;
  }
  // Make sure we are not on the first column
  if (x - 1 >= 0) {
    //Check left neighbor
    if (map.getCell(x - 1, y)) count++;
  }
  // Make sure we are not on the last column
  if (x + 1 < map.width) {
    //Check right neighbor
    if (map.getCell(x + 1, y)) count++;
  }
  // Make sure we are not on the bottom left corner
  if (y + 1 < map.height && x - 1 >= 0) {
    //Check bottom left neighbor
    if (map.getCell(x - 1, y + 1)) count++;
  }
  // Make sure we are not on the bottom right
  if (y + 1 < map.height && x + 1 < map.width) {
    //Check bottom right neighbor
    if (map.getCell(x + 1, y + 1)) count++;
  }

  // Make sure we are not on the last row
  if (y + 1 < map.height) {
    //Check bottom neighbor
    if (map.getCell(x, y + 1)) count++;
  }

  return count;
}

export class GameOfLife extends CellMap {
  evolve() {
    const nextGen = new CellMap(this.width, this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let neighbors = getNeighborCount(this, x, y);

        // Check the rules
        // If Alive
        if (this.getCell(x, y) === 1) {
          if (neighbors < 2) {
            nextGen.setCell(x, y, 0);
          } else if (neighbors === 2 || neighbors === 3) {
            nextGen.setCell(x, y, 1);
          } else if (neighbors > 3) {
            nextGen.setCell(x, y, 0);
          }
        } else if (this.getCell(x, y) === 0) {
          // If Dead or Empty

          if (neighbors === 3) {
            // Propogate the species
            nextGen.setCell(x, y, 1); // Birth
          }
        }
      }
    }

    this.replaceBuffer(nextGen.buffer);
  }

  replaceBuffer(buffer) {
    if (buffer.byteLength !== this.buffer.byteLength)
      throw new Error("new buffer is different length");
    this.buffer = buffer;
    this.view = new DataView(this.buffer);
  }
}
