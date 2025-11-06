/**
 * @function escapeHTML
 * @description Escapes special HTML characters (&, <, >, ", ') in a string to their
 * corresponding HTML entities. This prevents the browser from interpreting the characters
 * as markup or script, making the string safe for rendering in an HTML context.
 *
 * @exports
 * @param {string} str The input string to be escaped.
 * @returns {string} The HTML-safe escaped string.
 */
export const escapeHTML = (str) => String(str)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

/**
 * @function joinValues
 * @description Takes an array of objects (tokens) and concatenates the string values
 * of their `value` property into a single string. This is typically used to reconstruct
 * a full string from a sequence of parsed tokens.
 *
 * @exports
 * @param {Array<Object>} tokens An array where each object is expected to have a `value` property of type string.
 * @returns {string} The concatenated string of all token values.
 */
export function joinValues(tokens) {
  return tokens.map(t => t.value).join("");
}