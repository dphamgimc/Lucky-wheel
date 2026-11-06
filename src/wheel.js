export function parseNames(text) {
  return text.split('\n').map((name, line) => ({ name: name.trim(), line })).filter(entry => entry.name);
}
export function chooseEntry(entries, random = Math.random) {
  if (!entries.length) return null;
  const value = random();
  if (!(value >= 0 && value < 1)) throw new RangeError('Random must be in [0, 1)');
  return { ...entries[Math.floor(value * entries.length)] };
}
export function removeEntry(text, entry) {
  const lines = text.split('\n');
  if (lines[entry.line]?.trim() === entry.name) lines.splice(entry.line, 1);
  return lines.join('\n');
}
export function secureRandom() {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
}
