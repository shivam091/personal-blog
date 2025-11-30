import { BaseLexer } from "../base-lexer";
import { cssTokens } from "./constants";

export class CssLexer extends BaseLexer {
  run() {
    const s = this.input;

    while (!this.eof()) {
      const char = this.peekChar(); // Peek at the current character
      const start = this.pos; // Token start position

      // 1. Multi-line Comment
      if (s.startsWith(cssTokens.commentStart, this.pos)) {
        const end = s.indexOf(cssTokens.commentEnd, this.pos + 2);
        let j = this.length;

        if (end === -1) {
          // Unclosed comment check.
          this.lexerError("Unclosed CSS comment: Expected '*/'", start, this.length);
        } else {
          // Closed comment
          j = end + 2;
        }

        this.add("COMMENT", s.slice(start, j), start, j, "cp-token-comment");
        this.advancePosition(j - start);
        continue;
      }

      // 2. Block Open
      if (char === cssTokens.braceStart) {
        this.add("BLOCK_OPEN", cssTokens.braceStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 3. Block Close
      if (char === cssTokens.braceEnd) {
        this.add("BLOCK_CLOSE", cssTokens.braceEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 4. String literals
      if (char === "'" || char === '"') {
        const quoteType = char;
        this.advancePosition(1); // Consume opening quote

        // Scan until the closing quote
        while (!this.eof() && this.peekChar() !== quoteType) {
          // Handle escaped characters (e.g., 'it\'s')
          if (this.peekChar() === '\\' && this.peekChar(1)) {
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
          // Unclosed string literal: treat content found so far as a string error
          this.lexerError(`Unclosed string literal: Expected '${quoteType}'`, start, end);
          this.add("ERROR_STRING", s.slice(start, end), start, end, "cp-token-error");
        }
        continue;
      }

      // 5. Whitespace
      if (char === " ") {
        this.add("WHITESPACE", char, start, start + 1, "editor-token-space");
        this.advancePosition(1);
        continue;
      }

      // 6. Tab
      if (char === "\t") {
        this.add("TAB", char, start, start + 1, "editor-token-tab");
        this.advancePosition(1);
        continue;
      }

      // 5. Newline
      if (char === "\n" || char === "\r") {
        this.add("NEWLINE", char, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 7. Ignore all other characters
      let j = this.pos + 1;

      // We check if the next character starts ANY known token (comment, brace, quote, whitespace).
      while (j < this.length) {
        const nextChar = s[j];

        // If the next character starts a known token type, stop here.
        // Known starts: /, {, }, ', ", space, tab, newline.
        if (
            nextChar === "/" ||
            nextChar === cssTokens.braceStart || nextChar === cssTokens.braceEnd ||
            nextChar === "'" || nextChar === '"' ||
            nextChar === " " || nextChar === "\t" || nextChar === "\n" || nextChar === "\r"
        ) {
            break;
        }
        j++;
      }

      const value = s.slice(start, j);
      this.add("UNKNOWN", value, start, j, "cp-token-unknown");
      this.advancePosition(j - start);
      continue;
    }

    return this.tokens;
  }
}
