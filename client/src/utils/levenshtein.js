export function levenshtein(a, b) {
  const s = a.toLowerCase().trim();
  const t = b.toLowerCase().trim();
  const m = s.length;
  const n = t.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prevRow = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const currRow = [i];
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      currRow[j] = Math.min(currRow[j - 1] + 1, prevRow[j] + 1, prevRow[j - 1] + cost);
    }
    prevRow = currRow;
  }
  return prevRow[n];
}

export function isCloseEnough(input, expected, maxDistance = 1) {
  return levenshtein(input, expected) <= maxDistance;
}
