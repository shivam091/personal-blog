/**
 * Helper to escape characters for a RegExp constructor.
 * @param {string} s
 * @returns {string}
 */
export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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