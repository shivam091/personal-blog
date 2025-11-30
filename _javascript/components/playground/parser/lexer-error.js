export class LexerError extends Error {
  constructor(message, token) {
    super(message);
    this.name = "LexerError";
    this.token = token;
  }
}
