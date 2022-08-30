export function setChunkBit(chunk, i, v) {
  if (v === 0) {
    return (255 ^ (1 << i)) & chunk;
  } else if (v === 1) {
    return (1 << i) | chunk;
  }
  return chunk;
}

export class CellMap {
  constructor(width, height, buffer) {
    this.size = width * height;
    this.width = width;
    this.height = height;
    if (buffer) {
      if (buffer.byteLength !== Math.ceil(this.size / 8))
        throw new Error("buffer is not the right size");
      this.buffer = buffer;
    } else this.buffer = new ArrayBuffer(Math.ceil(this.size / 8));
    this.view = new DataView(this.buffer);
  }

  getCell(x, y) {
    const index = x + y * this.width;
    const chunk = Math.floor(index / 8);
    const offset = index - chunk * 8;
    return (this.view.getUint8(chunk) & (1 << offset)) >> offset;
  }
  setCell(x, y, v) {
    const index = x + y * this.width;
    const chunk = Math.floor(index / 8);
    const offset = index - chunk * 8;
    this.view.setUint8(
      chunk,
      setChunkBit(this.view.getUint8(chunk), offset, v)
    );
  }

  getChunks() {
    return new Uint8Array(this.buffer);
  }

  format() {
    let str = "";
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        str += this.getCell(x, y);
      }
      str += "\n";
    }
    return str.trim();
  }

  getDebug() {
    return `
Chunks:
${this.getChunks()}
Format:
${this.format()}
    `;
  }
}
