let patterns = null;
export async function getPatterns() {
  if (!patterns) {
    patterns = await fetch("/patterns").then((res) => res.json());
  }
  return patterns;
}
