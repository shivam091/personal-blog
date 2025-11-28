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

      // 4. Parenthesis Open
      if (char === cssTokens.parenStart) {
        this.add("PAREN_OPEN", cssTokens.parenStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 5. Parenthesis Close
      if (char === cssTokens.parenEnd) {
        this.add("PAREN_CLOSE", cssTokens.parenEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 6. Whitespace
      if (char === " ") {
        this.add("WHITESPACE", char, start, start + 1, "editor-token-space");
        this.advancePosition(1);
        continue;
      }

      // 7. Tab
      if (char === "\t") {
        this.add("TAB", char, start, start + 1, "editor-token-tab");
        this.advancePosition(1);
        continue;
      }

      // 8. Semicolon
      if (char === cssTokens.semicolon) {
        this.add("SEMICOLON", char, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 9. Newline
      if (char === "\n" || char === "\r") {
        this.add("NEWLINE", char, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 10. AT-RULES
      if (char === "@") {
        let i = this.pos + 1;
        // At-rules must be followed by an identifier pattern
        if (/[a-zA-Z_-]/.test(s[i])) {
          i++;
          while (i < this.length && /[a-zA-Z0-9_-]/.test(s[i])) {
            i++;
          }
        }

        const value = s.slice(start, i);
        if (cssTokens.atRules.has(value)) {
          this.add("AT_RULE", value, start, i, "cp-token-keyword");
          this.advancePosition(i - start);
          continue;
        }
      }

      // 11. Identifiers/Functions
      if (/[a-zA-Z_-]/.test(char)) {
        let i = this.pos + 1;
        while (i < this.length && /[a-zA-Z0-9_-]/.test(s[i])) {
          i++;
        }
        const value = s.slice(start, i);

        // Check for function: Identifier immediately followed by '('
        if (s[i] === cssTokens.parenStart && cssTokens.functions.has(value)) {
          // Tokenize as a CSS_FUNCTION
          this.add("CSS_FUNCTION", value, start, i, "cp-token-function");
        } else {
          // Tokenize as a generic IDENTIFIER (or something else if you define it)
          this.add("IDENTIFIER", value, start, i); // No special class for now
        }

        this.advancePosition(i - start);
        continue;
      }

      // 12. Ignore all other characters and tokenize as 'TEXT' or similar for now
      this.add("TEXT", char, start, start + 1);
      this.advancePosition(1);
    }

    return this.tokens;
  }
}
