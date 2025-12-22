export class LexerError extends Error {
  constructor(message, start, end) {
    super(message);
    this.name = "LexerError";
    this.start = start;
    this.end = end;
  }
}
