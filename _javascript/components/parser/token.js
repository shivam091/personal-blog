export class Token {
  constructor(type, value, start, end, spanClass = "") {
    this.type = type; // semantic token type e.g. IDENT, STRING
    this.value = value; // raw value
    this.start = start; // numeric index in source
    this.end = end; // numeric index in source
    this.spanClass = spanClass; // css class for highlighting
  }
}