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
