// Simplified Token class.
export class Token {
  constructor(type, value, start, end, highlightClass = "", line = 0, col = 0) {
    this.type = type; // Semantic token type e.g. IDENT, STRING
    this.value = value; // Raw value
    this.start = start; // Numeric start index in source
    this.end = end; // Numeric end index in source
    this.highlightClass = highlightClass; // CSS class for highlighting
    this.line = line; // 1-based line number
    this.col = col; // 1-based column number
  }
}
