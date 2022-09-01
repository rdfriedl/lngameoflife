const MAX_INT_16 = 65535;
const CHUNK_SIZE = 4;
const BYTES_PER_CHUNK = 2; // two bytes per chunk since we are using Uint16

export function getChunkBit(chunk, x, y) {
  const i = x + y * 4;
  return (chunk & (1 << i)) >> i;
}
export function setChunkBit(chunk, x, y, v) {
  const i = x + y * 4;
  if (v === 0) {
    return (MAX_INT_16 ^ (1 << i)) & chunk;
  } else if (v === 1) {
    return (1 << i) | chunk;
  }
  return chunk;
}

export class CellMap {
  constructor(width, height, buffer) {
    this.width = width;
    this.height = height;
    this.byteLength = this.hChunks * this.vChunks * BYTES_PER_CHUNK;

    if (buffer) {
      this.buffer = buffer;
    } else this.reset();
  }

  get buffer() {
    return this._buffer;
  }
  set buffer(newBuffer) {
    if (newBuffer.byteLength !== this.byteLength)
      throw new Error("buffer is not the right size");
    this._buffer = newBuffer;
    this._dataview = null;
  }
  get dataview() {
    return this._dataview || (this._dataview = new DataView(this.buffer));
  }
  get isEmpty() {
    return !!this.getChunks.find((v) => v !== 0);
  }

  get hChunks() {
    return Math.ceil(this.width / CHUNK_SIZE);
  }
  get vChunks() {
    return Math.ceil(this.width / CHUNK_SIZE);
  }

  getChunkIndex(cx, cy) {
    return (cx + cy * this.hChunks) * BYTES_PER_CHUNK;
  }
  getChunk(cx, cy) {
    return this.dataview.getUint16(this.getChunkIndex(cx, cy));
  }
  setChunk(cx, cy, chunk) {
    return this.dataview.setUint16(this.getChunkIndex(cx, cy), chunk);
  }

  getCell(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
    const cx = Math.floor(x / CHUNK_SIZE);
    const cy = Math.floor(y / CHUNK_SIZE);
    const chunk = this.getChunk(cx, cy);
    return getChunkBit(chunk, x - cx * CHUNK_SIZE, y - cy * CHUNK_SIZE);
  }
  setCell(x, y, v) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const cx = Math.floor(x / CHUNK_SIZE);
    const cy = Math.floor(y / CHUNK_SIZE);
    const chunk = this.getChunk(cx, cy);
    return this.setChunk(
      cx,
      cy,
      setChunkBit(chunk, x - cx * CHUNK_SIZE, y - cy * CHUNK_SIZE, v)
    );
  }

  getChunks() {
    return new Uint16Array(this.buffer);
  }

  replaceBuffer(buffer) {
    this.buffer = buffer;
  }

  reset() {
    this.buffer = new ArrayBuffer(this.byteLength);
  }

  format() {
    const lines = [];
    for (let y = 0; y < this.height; y++) {
      let line = "";
      for (let x = 0; x < this.width; x++) {
        line += this.getCell(x, y) ? "■" : "□";
      }
      lines.push(line);
    }
    return lines.join("\n");
  }

  formatChunks() {
    const lines = [];
    for (let y = 0; y < this.vChunks * CHUNK_SIZE; y++) {
      if (y === 0)
        lines.push("┏" + Array(this.hChunks).fill("━━━━").join("┯") + "┓");
      else if (y % CHUNK_SIZE === 0)
        lines.push("┠" + Array(this.hChunks).fill("────").join("┼") + "┨");

      let line = "";
      for (let x = 0; x < this.hChunks * CHUNK_SIZE; x++) {
        if (x === 0) line += "┃";
        else if (x % CHUNK_SIZE === 0) line += "│";
        line += this.getCell(x, y) ? "■" : "□";
      }
      line += "┃";
      lines.push(line);
    }
    // bottom border
    lines.push("┗" + Array(this.hChunks).fill("━━━━").join("┷") + "┛");
    return lines.join("\n");
  }

  getDebug() {
    return `
Chunks:
${this.formatChunks()}
Format:
${this.format()}
    `;
  }
}
