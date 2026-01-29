import { BaseLexer } from "../base-lexer";
import { cssTokens } from "./tokens";

export class CssLexer extends BaseLexer {
  static STATIC_TOKENS = {
    "{": "BLOCK_OPEN",
    "}": "BLOCK_CLOSE",
  };
  static KEYS = Object.keys(CssLexer.STATIC_TOKENS).sort((a, b) => b.length - a.length);

  run() {
    const s = this.input;

    while (!this.eof()) {
      const char = this.peekChar(); // Peek at the current character
      const start = this.pos; // Token start position

      // 1. Multi-line Comment
      if (this.input.startsWith(cssTokens.commentStart, this.pos)) {
        this.consumeMultiLineComment(cssTokens.commentStart, cssTokens.commentEnd);
        continue;
      }

      // 2. Static tokens
      if (this.handleStaticTokens(CssLexer.STATIC_TOKENS, CssLexer.KEYS)) continue;

      // 3. Whitespace
      if (this.handleWhitespace()) continue;

      // 4. Custom properties (variables)
      if (s.startsWith("--", this.pos)) {
        const propStart = this.pos;
        this.advancePosition(2); // Consume the initial '--'

        let j = this.pos; // j is now pointing to the character after '--'

        // CSS custom properties allow any valid identifier characters, including digits
        // right after the initial --
        while (j < this.length && /[a-zA-Z0-9_\-]/.test(s[j])) {
          j++;
        }

        const value = s.slice(propStart, j);

        // A valid custom property must be longer than just '--'
        if (value.length > 2) {
          this.add("CUSTOM_PROPERTY", value, propStart, j, "token-variable");
          this.advancePosition(j - this.pos); // Advance past the identifier part
          continue;
        }

        this.lexerError("Invalid CSS custom property: Name expected after '--'", propStart, j);
        this.add("ERROR_TOKEN", value, propStart, j, "token-error");
        this.advancePosition(j - this.pos);
        continue;
      }

      this.add("TEXT", char, start, start + 1);
      this.advancePosition(1);
      continue;
    }

    return this.tokens;
  }
}
