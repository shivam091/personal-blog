export class ParserError extends Error {
  constructor(message, token) {
    super(message);
    this.name = "ParserError";
    this.token = token;
  }
}
