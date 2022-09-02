import { promises as fsp } from "fs";
import path from "path";

const patterns = [];

export async function loadPatters() {
  const folder = "./patterns";
  const files = await fsp.readdir(folder);
  for (const file of files) {
    if (file.includes("README")) continue;
    const contents = await fsp.readFile(path.join(folder, file), {
      encoding: "utf-8",
    });
    const rle = contents.match(/^[\dbo$][\dbo$\n\r]*!/gim)?.[0] || undefined;
    const name = /^#N (.+)$/gim.exec(contents)?.[1] || undefined;
    const author = /^#O (.+)$/gim.exec(contents)?.[1] || undefined;
    const comments = Array.from(contents.matchAll(/^#C (.+)$/gm)).map(
      (m) => m[1]
    );

    const pattern = {
      name,
      author,
      rle,
      comments,
    };

    if (!pattern.rle) {
      console.log(`Failed to read ${file}`);
    }

    patterns.push(pattern);
  }
}

export async function getPatterns() {
  if (patterns.length === 0) await loadPatters();

  return patterns;
}
