/*
 * Defines the base structure for a lexical token.
 * This class captures the type, value, position (both byte and line/col),
 * and styling necessary for downstream processing (Parser, Highlighter, Error Handler).
 */
export class Token {
  constructor(type, value, start, end, highlightClass = "", line = 0, col = 0) {
    this.type = type; // Semantic token type e.g. IDENT, STRING
    this.value = value; // Raw value

    // Position Indices (0-based byte offset)
    this.start = start; // Numeric start index in source
    this.end = end; // Numeric end index in source
    this.highlightClass = highlightClass; // CSS class for highlighting

    // Position Coordinates (1-based for display)
    this.line = line; // 1-based line number
    this.col = col; // 1-based column number
  }
}
