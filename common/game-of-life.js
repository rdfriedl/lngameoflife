import { CellMap, CHUNK_SIZE } from "./cell-map.js";

const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

export class GameOfLife extends CellMap {
  constructor(...args) {
    super(...args);

    this.activeChunks = new CellMap(this.hChunks, this.vChunks);
  }

  getNeighborCount(x, y, map = this) {
    let count = 0;
    for (const [x1, y1] of DIRECTIONS) {
      if (map.getCell(x + x1, y + y1)) count++;
    }
    return count;
  }

  createLife(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    this.setCell(x, y, 1);
    if (v === 1) {
      const cx = Math.floor(x / CHUNK_SIZE);
      const cy = Math.floor(y / CHUNK_SIZE);
      this.setChunkActive(cx, cy);
    }
  }

  requestFullMapUpdate() {
    for (let cy = 0; cy < this.vChunks; cy++) {
      for (let cx = 0; cx < this.hChunks; cx++) {
        this.activeChunks.setCell(cx, cy, 1);
      }
    }
  }

  evolve() {
    const stats = { chunks: 0, cells: 0 };
    const nextGen = new CellMap(this.width, this.height);
    const nextActiveChunks = new CellMap(this.hChunks, this.vChunks);

    // only process active chunks
    for (let cy = 0; cy < this.vChunks; cy++) {
      for (let cx = 0; cx < this.hChunks; cx++) {
        if (!this.activeChunks.getCell(cx, cy)) continue;
        stats.chunks++;
        let isActive = false;

        for (let ly = 0; ly < CHUNK_SIZE; ly++) {
          for (let lx = 0; lx < CHUNK_SIZE; lx++) {
            stats.cells++;
            const x = cx * CHUNK_SIZE + lx;
            const y = cy * CHUNK_SIZE + ly;

            let neighbors = this.getNeighborCount(x, y);
            // Check the rules
            if (this.getCell(x, y) === 1) {
              if (neighbors < 2) {
                // cell dies
                nextGen.setCell(x, y, 0);
                isActive = true;
              } else if (neighbors === 2 || neighbors === 3) {
                // keep the cell
                nextGen.setCell(x, y, 1);
                isActive = true;
              } else if (neighbors > 3) {
                // cell dies
                nextGen.setCell(x, y, 0);
                isActive = true;
              }
            } else if (this.getCell(x, y) === 0) {
              if (neighbors === 3) {
                // Propogate the species
                nextGen.setCell(x, y, 1); // Birth
                isActive = true;
              }
            }
          }
        }

        if(isActive){
          // mark this chunk and its neighbors as active because where was a change
          nextActiveChunks.setCell(cx, cy, 1);
          for (const [x1, y1] of DIRECTIONS) {
            nextActiveChunks.setCell(cx + x1, cy + y1, 1);
          }
        }
      }
    }
    // process every cell
    // for (let y = 0; y < this.height; y++) {
    //   for (let x = 0; x < this.width; x++) {
    //     stats.cells++;
    //     let neighbors = this.getNeighborCount(x, y);

    //     // Check the rules
    //     if (this.getCell(x, y) === 1) {
    //       if (neighbors < 2) {
    //         nextGen.setCell(x, y, 0);
    //       } else if (neighbors === 2 || neighbors === 3) {
    //         nextGen.setCell(x, y, 1);
    //       } else if (neighbors > 3) {
    //         nextGen.setCell(x, y, 0);
    //       }
    //     } else if (this.getCell(x, y) === 0) {
    //       if (neighbors === 3) {
    //         nextGen.setCell(x, y, 1); // Birth
    //       }
    //     }
    //   }
    // }

    this.replaceBuffer(nextGen.buffer);
    this.activeChunks.replaceBuffer(nextActiveChunks.buffer);

    return stats;
  }
}
