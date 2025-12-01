import { BaseLexer } from "../base-lexer";
import { jsTokens } from "./constants";

export class JsLexer extends BaseLexer {
  run() {
    const s = this.input;

    while (!this.eof()) {
      const char = this.peekChar(); // Peek at the current character
      const start = this.pos; // Capture start position

      // 1. Multi-line Comment
      if (s.startsWith(jsTokens.commentStart, this.pos)) {
        const end = s.indexOf(jsTokens.commentEnd, this.pos + 2);
        let j = this.length;

        if (end === -1) {
          // Unclosed comment check.
          this.lexerError("Unclosed JavaScript comment: Expected '*/'", start, this.length);
        } else {
          // Closed comment
          j = end + 2;
        }

        this.add("COMMENT", s.slice(start, j), start, j, "cp-token-comment");
        this.advancePosition(j - start);
        continue;
      }

      // 2. Single-line Comment
      if (s.startsWith(jsTokens.singleLineComment, this.pos)) {
        let j = this.pos + 2;
        // Scan to the end of the line ('\n') or EOF
        while (j < this.length && s[j] !== "\n") j++;
        // Note: The parser handles checking if this single-line token spans multiple lines
        this.add("SINGLE_COMMENT", s.slice(start, j), start, j, "cp-token-comment");
        this.advancePosition(j - start);
        continue;
      }

      // 3. Block Open
      if (char === jsTokens.braceStart) {
        this.add("BLOCK_OPEN", jsTokens.braceStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 4. Block Close
      if (char === jsTokens.braceEnd) {
        this.add("BLOCK_CLOSE", jsTokens.braceEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 5. Parenthesis Open (()
      if (char === jsTokens.parenStart) {
        this.add("PAREN_OPEN", jsTokens.parenStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 6. Parenthesis Close ())
      if (char === jsTokens.parenEnd) {
        this.add("PAREN_CLOSE", jsTokens.parenEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 7. Bracket Open ([)
      if (char === jsTokens.bracketStart) {
        this.add("BRACKET_OPEN", jsTokens.bracketStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 8. Bracket Close (])
      if (char === jsTokens.bracketEnd) {
        this.add("BRACKET_CLOSE", jsTokens.bracketEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 9. String literals
      if (char === "'" || char === '"') {
        const quoteType = char;
        this.advancePosition(1); // Consume opening quote

        // Scan until the closing quote
        while (!this.eof() && this.peekChar() !== quoteType) {
          // Check for illegal newline inside unescaped string
          // if (this.peekChar() === "\n" || this.peekChar() === "\r") {
          //   this.lexerError(`Illegal newline in string literal: Expected '${quoteType}'`, start, this.pos);
          //   this.add("ERROR_STRING", s.slice(start, this.pos), start, this.pos, "cp-token-error");
          //   this.advancePosition(1); // Advance past the newline to recover
          //   continue;
          // }

          // Handle escaped characters (e.g., 'it\'s')
          if (this.peekChar() === "\\" && this.peekChar(1)) {
            this.advancePosition(2); // Consume '\' and the escaped character
            continue;
          }

          this.advancePosition(1);
        }

        const end = this.pos;

        // Check for closing quote
        if (this.peekChar() === quoteType) {
          this.advancePosition(1); // Consume closing quote
          this.add("STRING", s.slice(start, this.pos), start, this.pos, "cp-token-string");
        } else {
          // Log error and create a LexerError object (using the refactored method)
          this.lexerError(`Unclosed string literal: Expected '${quoteType}'`, start, end);
          // Add the token anyway, but use a specific error type/class for visualization
          this.add("ERROR_STRING", s.slice(start, end), start, end, "cp-token-error");
        }
        continue;
      }

      // 10. Operators
      let matchedOperator = null;
      for (const op of jsTokens.operators) {
        if (s.startsWith(op, this.pos)) {
          matchedOperator = op;
          break; // Found the longest match
        }
      }

      if (matchedOperator) {
        const length = matchedOperator.length;
        this.add("OPERATOR", matchedOperator, start, start + length, "cp-delimiter");
        this.advancePosition(length);
        continue;
      }

      // 10. Whitespace (explicitly handle standard space and other non-newline whitespace)
      if (/\s/.test(char) && char !== "\n" && char !== "\r" && char !== "\t") {
        this.add("WHITESPACE", char, start, start + 1, "editor-token-space");
        this.advancePosition(1);
        continue;
      }

      // 11. Tab
      if (char === "\t") {
        this.add("TAB", char, start, start + 1, "editor-token-tab");
        this.advancePosition(1);
        continue;
      }

      // 12. Newline
      if (char === "\n" || char === "\r") {
        this.add("NEWLINE", char, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 13. Ignore all other characters
      let j = this.pos + 1;

      // We check if the next character starts ANY known token (comment, brace, quote, whitespace).
      while (j < this.length) {
        const nextChar = s[j];

        // If the next character starts a known token type, stop here.
        // Known starts: /, {, }, (, ), [, ], ', ", space, tab, newline.
        // We can check if the character is one of the starting characters of an operator.
        const opStarts = new Set(Array.from(jsTokens.operators).map(op => op[0]));

        if (
            nextChar === "/" ||
            nextChar === jsTokens.braceStart || nextChar === jsTokens.braceEnd ||
            nextChar === jsTokens.parenStart || nextChar === jsTokens.parenEnd ||
            nextChar === jsTokens.bracketStart || nextChar === jsTokens.bracketEnd ||
            nextChar === "'" || nextChar === '"' ||
            /\s/.test(nextChar) ||
            opStarts.has(nextChar)
        ) {
            break;
        }
        j++;
      }

      const value = s.slice(start, j);
      this.add("TEXT", value, start, j, "cp-token-unknown");
      this.advancePosition(j - start);
      continue;
    }

    return this.tokens;
  }
}
