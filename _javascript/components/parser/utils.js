/**
 * Escapes HTML characters for safe rendering.
 * @param {string} s
 * @returns {string}
 */
export const escapeHTML = (s) => String(s)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

export function joinValues(tokens) {
  return tokens.map(t => t.value).join("");
}