import { LexerError } from "./lexer-error";
import { Token } from "./token";
import { getLineStarts, indexToLine } from "./utils";

/*
 * BaseLexer provides common infrastructure for lexical analysis.
 * It manages input traversal, token emission, position tracking (line/column),
 * and error collection, while delegating actual tokenization logic to subclasses.
 */
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

  /*
   * Creates a token with accurate line and column metadata and adds it to the token stream.
   * Converts absolute character indices into 1-based line and column positions for diagnostics
   * and syntax highlighting.
   */
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

  /*
   * Peeks at a character in the input string relative to the current position (`this.pos`).
   * Does not advance the position.
   */
  peekChar(offset = 0) {
    return this.input[this.pos + offset];
  }

  /*
   * Checks if the current reading position has reached or exceeded the end of the input string.
   */
  eof() {
    return this.pos >= this.length;
  }

  /*
   * Collects lexical errors using the new LexerError class
   */
  lexerError(message, start, end) {
    this.errors.push(new LexerError(message, start, end));
    console.warn(`[Lexer Error] ${message} at pos ${start}`);
  }

  /*
   * Moves the current reading position forward by a specified number of characters.
   * This is called after a token has been successfully recognized and emitted.
   */
  advancePosition(n = 1) {
    this.pos += n;
    return this.pos; // Often returns the new position
  }

  /*
   * Placeholder method for the main tokenization logic.
   * Subclasses must implement this method to perform the actual lexical analysis
   * and call `this.add()` or `this.lexerError()`.
   */
  run() {
    throw new Error("BaseLexer.run must be implemented by subclass");
  }
}
