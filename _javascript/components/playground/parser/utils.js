/*
 * Escapes special HTML characters (&, <, >, ", ') in a string to their
 * corresponding HTML entities. This prevents the browser from interpreting the characters
 * as markup or script, making the string safe for rendering in an HTML context.
 */
export const escapeHTML = (str) => String(str)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

/*
 * Takes an array of objects (tokens) and concatenates the string values
 * of their `value` property into a single string. This is typically used to reconstruct
 * a full string from a sequence of parsed tokens.
 */
export function joinValues(tokens) {
  return tokens.map(token => token.value).join("");
}

/*
 * Pre-calculates line starting positions for fast index-to-line conversion.
 */
export function getLineStarts(src) {
  const lineStarts = [0];
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "\n") {
      lineStarts.push(i + 1);
    }
  }
  return lineStarts;
}

/*
 * Converts a character index to a 1-based line number.
 */
export function indexToLine(index, lineStarts) {
  let low = 0;
  let high = lineStarts.length - 1;
  let result = 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lineStarts[mid] <= index) {
      result = mid + 1;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return result;
}
