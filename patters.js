import { promises as fsp } from "fs";
import path from "path";

const patterns = [];

export async function loadPatters() {
  const folder = "./patterns";
  const files = await fsp.readdir(folder);
  for (const file of files) {
    const contents = await fsp.readFile(path.join(folder, file), {
      encoding: "utf-8",
    });
    const rle = contents.match(/^\d[\dbo$\n]+!/gm)?.[0] || undefined;
    const name = contents.match(/^#N (.+)$/gm)?.[0] || undefined;
    const author = contents.match(/^#O (.+)$/gm)?.[0] || undefined;
    const comments = Array.from(contents.matchAll(/^#C (.+)$/gm)).map(
      (m) => m[1]
    );

    const pattern = {
      name,
      author,
      rle,
      comments,
    };

    patterns.push(pattern);
  }
}

export async function getPatterns() {
  if (patterns.length === 0) await loadPatters();

  return patterns;
}
