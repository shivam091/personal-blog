import { BaseLexer } from "../base-lexer";
import { jsTokens } from "./tokens";

export class JsLexer extends BaseLexer {
  run() {
    const s = this.input;

    while (!this.eof()) {
      const char = this.peekChar(); // Peek at the current character
      const start = this.pos; // Capture start position

      // 1. Multi-line Comment
      if (this.input.startsWith(jsTokens.commentStart, this.pos)) {
        const end = this.input.indexOf(jsTokens.commentEnd, this.pos + jsTokens.commentStart.length);

        // Open
        this.add("COMMENT_OPEN", jsTokens.commentStart, start, start + jsTokens.commentStart.length, "token-comment");
        this.advancePosition(jsTokens.commentStart.length);

        // Body (Line-by-line)
        const bodyEnd = (end === -1) ? this.length : end;
        while (this.pos < bodyEnd) {
          let lineEnd = this.input.indexOf("\n", this.pos);
          if (lineEnd === -1 || lineEnd >= bodyEnd) lineEnd = bodyEnd;
          else lineEnd += 1;

          this.add("COMMENT_TEXT", this.input.slice(this.pos, lineEnd), this.pos, lineEnd, "token-comment");
          this.advancePosition(lineEnd - this.pos);
        }

        // Close
        if (end !== -1) {
          this.add("COMMENT_CLOSE", jsTokens.commentEnd, end, end + jsTokens.commentEnd.length, "token-comment");
          this.advancePosition(jsTokens.commentEnd.length);
        } else {
          this.lexerError(`Unclosed comment: Expected '${jsTokens.commentEnd}'`, start, this.length);
        }
        continue;
      }

      // 2. Single-line Comment
      if (s.startsWith(jsTokens.singleLineComment, this.pos)) {
        let j = this.pos + 2;
        // Scan to the end of the line ('\n') or EOF
        while (j < this.length && s[j] !== "\n") j++;
        // Note: The parser handles checking if this single-line token spans multiple lines
        this.add("SINGLE_COMMENT", s.slice(start, j), start, j, "token-comment");
        this.advancePosition(j - start);
        continue;
      }

      // 3. Whitespace (explicitly handle standard space and other non-newline whitespace)
      if (/\s/.test(char) && char !== "\n" && char !== "\r" && char !== "\t") {
        this.add("WHITESPACE", char, start, start + 1, "token-space");
        this.advancePosition(1);
        continue;
      }

      // 4. Tab
      if (char === "\t") {
        this.add("TAB", char, start, start + 1, "token-tab");
        this.advancePosition(1);
        continue;
      }

      // 5. Newline
      if (char === "\n" || char === "\r") {
        this.add("NEWLINE", char, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 6. Block Open
      if (char === jsTokens.braceStart) {
        this.add("BLOCK_OPEN", jsTokens.braceStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 7. Block Close
      if (char === jsTokens.braceEnd) {
        this.add("BLOCK_CLOSE", jsTokens.braceEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 8. Parenthesis Open (()
      if (char === jsTokens.parenStart) {
        this.add("PAREN_OPEN", jsTokens.parenStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 9. Parenthesis Close ())
      if (char === jsTokens.parenEnd) {
        this.add("PAREN_CLOSE", jsTokens.parenEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 10. Bracket Open ([)
      if (char === jsTokens.bracketStart) {
        this.add("BRACKET_OPEN", jsTokens.bracketStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 11. Bracket Close (])
      if (char === jsTokens.bracketEnd) {
        this.add("BRACKET_CLOSE", jsTokens.bracketEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 12. String literals
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
          // if (this.peekChar() === "\\" && this.peekChar(1)) {
          //   this.advancePosition(2); // Consume '\' and the escaped character
          //   continue;
          // }

          this.advancePosition(1);
        }

        const end = this.pos;

        // Check for closing quote
        if (this.peekChar() === quoteType) {
          this.advancePosition(1); // Consume closing quote
          this.add("STRING", s.slice(start, this.pos), start, this.pos, "token-string");
        } else {
          // Log error and create a LexerError object (using the refactored method)
          this.lexerError(`Unclosed string literal: Expected '${quoteType}'`, start, end);
          // Add the token anyway, but use a specific error type/class for visualization
          this.add("ERROR_STRING", s.slice(start, end), start, end, "token-error");
        }
        continue;
      }

      // 13. Ignore all other characters (including newlines and other content)
      this.add("TEXT", char, start, start + 1);
      this.advancePosition(1);
      continue;
    }

    return this.tokens;
  }
}
