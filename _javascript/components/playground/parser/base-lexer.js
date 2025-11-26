import { LexerError } from "./lexer-error";
import { Token } from "./token";
import { getLineStarts, indexToLine } from "./utils";

// Base lexer
export class BaseLexer {
  constructor(input = "") {
    this.input = input;
    this.pos = 0;
    this.length = input.length;
    this.tokens = [];
    this.errors = [];

    // Store line starts
    this.lineStarts = getLineStarts(input);
  }

  add(type, value, start, end, highlightClass) {
    // 1. Get the 1-based line number using the optimized binary search utility
    const oneBasedLine = indexToLine(start, this.lineStarts);

    // 2. Find the start of the current line (required to calculate column)
    // Note: The line index is (oneBasedLine - 1)
    const zeroBasedLineIndex = oneBasedLine - 1;
    const lineStart = this.lineStarts[zeroBasedLineIndex];

    // 3. Calculate the 1-based column number
    const zeroBasedCol = start - lineStart;
    const oneBasedCol = zeroBasedCol + 1; // Convert to 1-based

    // Pass 1-based line and col
    const token = new Token(
      type,
      value,
      start,
      end,
      highlightClass,
      oneBasedLine,
      oneBasedCol
    );
    this.tokens.push(token);
  }

  peekChar(offset = 0) {
    return this.input[this.pos + offset];
  }

  eof() {
    return this.pos >= this.length;
  }

  // Collects lexical errors using the new LexerError class
  lexerError(message, start, end) {
    this.errors.push(new LexerError(message, start, end));
    console.warn(`[Lexer Error] ${message} at pos ${start}`);
  }

  // Method to move the current reading position forward
  advancePosition(n = 1) {
    this.pos += n;
    return this.pos; // Often returns the new position
  }

  run() {
    throw new Error("BaseLexer.run must be implemented by subclass");
  }
}
