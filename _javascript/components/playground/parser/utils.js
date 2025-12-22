/*
 * Mapping of characters to their corresponding HTML entities.
 */
const htmlEscapes = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
};

/*
 * Escapes special HTML characters (&, <, >, ", ') in a string to their
 * corresponding HTML entities. This prevents the browser from interpreting the characters
 * as markup or script, making the string safe for rendering in an HTML context.
 */
export const escapeHTML = (str) => {
  return String(str).replace(/[&<>"']/g, (match) => htmlEscapes[match]);
};

/*
 * Takes an array of objects (tokens) and concatenates the string values
 * of their `value` property into a single string.
 */
export function joinValues(tokens) {
  return tokens.map(token => token.value).join("");
}

/*
 * Pre-calculates line starting positions for fast index-to-line conversion.
 * It assumes standard line endings (LF: \n, or CRLF: \r\n).
 */
export function getLineStarts(src) {
  const lineStarts = [0];

  for (let i = 0; i < src.length; i++) {
    const char = src[i];

    // Handle \n (Unix) or \r\n (Windows - skip the \n after \r)
    if (src[i] === "\n") {
      lineStarts.push(i + 1);
    }
    // Handle \r (Old Mac) or start of Windows
    else if (char === "\r") {
      // Check if next char is \n to avoid double counting Windows CRLF
      if (src[i+1] === "\n") continue;
      lineStarts.push(i + 1);
    }
  }

  return lineStarts;
}

/*
 * Converts a 0-based character index to a 1-based line number using binary search.
 * This is highly optimized for performance (O(log L), where L is the number of lines).
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
