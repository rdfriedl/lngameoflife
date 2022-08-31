import { CellMap } from "./cell-map.js";

export function encode(map) {
  // TODO: optimize
  let str = "!";
  for (let y = map.height - 1; y >= 0; y--) {
    let lastValue;
    let run = 0;
    for (let x = map.width - 1; x >= 0; x--) {
      const v = map.getCell(x, y);
      if (v !== lastValue) {
        if (run > 1) str = "" + run + str;

        const tag = v === 1 ? "o" : "b";
        str = tag + str;
        run = 1;
        lastValue = v;
      } else run++;
    }
    if (run > 1) str = "" + run + str;
    if (y !== 0) str = "$" + str;
  }

  return str;
}

function read(rle) {
  const commands = rle.replaceAll(/[\r\n]/g, "").matchAll(/\d*?[bo$!]/g);
  const lines = [[]];
  let currentLine = 0;
  let width = 0;

  for (const [command] of commands) {
    const run = parseInt(command.slice(0, command.length - 1) || "1");
    const tag = command.charAt(command.length - 1);

    switch (tag) {
      case "b":
        lines[currentLine].push(...Array(run).fill(0));
        break;
      case "o":
        lines[currentLine].push(...Array(run).fill(1));
        break;
      case "$":
        //update the width
        width = Math.max(width, lines[currentLine].length);
        // skip to new line
        currentLine += run;
        lines[currentLine] = [];
        break;
      case "!":
        // measure the last line
        width = Math.max(width, lines[currentLine].length);
        break;
    }
  }
  const height = lines.length;

  return {
    lines,
    width,
    height,
  };
}

export function decode(rle) {
  const { lines, width, height } = read(rle);
  const map = new CellMap(width, height);
  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    if (line) {
      for (let x = 0; x < line.length; x++) {
        const v = line[x];
        map.setCell(x, y, v);
      }
    }
  }

  return map;
}

export function readIntoMap(x, y, rle, map, ignoreDead = false) {
  const { lines } = read(rle);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line) {
      for (let k = 0; k < line.length; k++) {
        if (!ignoreDead || line[k]) {
          map.setCell(x + k, y + i, line[k]);
        }
      }
    }
  }
}
