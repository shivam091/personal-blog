export function createTokenizer(patterns) {
  return function tokenize(input) {
    const tokens = [];
    let match;
    const regex = new RegExp(patterns.join("|"), "gy");

    while ((match = regex.exec(input))) {
      const value = match[0];
      const type = /^[A-Za-z_]\w*$/.test(value)
        ? "identifier"
        : /^\d+$/.test(value)
        ? "number"
        : "symbol";

      if (!/\s+/.test(value)) {
        tokens.push({ type, value, start: match.index, end: regex.lastIndex });
      }
    }
    return tokens;
  };
}
