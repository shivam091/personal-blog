import { Token } from "./token";

export class BaseLexer {
  constructor(input = "") {
    this.input = input;
    this.pos = 0;
    this.length = input.length;
    this.tokens = [];
  }

  setInput(input) {
    this.input = input;
    this.pos = 0;
    this.length = input.length;
    this.tokens = [];
  }

  add(type, value, start, end, spanClass = "") {
    const token = new Token(type, value, start, end, spanClass)
    this.tokens.push(token);
  }

  peekChar(offset = 0) {
    return this.input[this.pos + offset];
  }

  eof() {
    return this.pos >= this.length;
  }

  run() {
    throw new Error("BaseLexer.run must be implemented by subclass");
  }
}