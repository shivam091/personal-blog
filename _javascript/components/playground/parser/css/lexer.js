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

      // 4. Whitespace
      if (this.handleWhitespace()) continue;

      // 5. Ignore all other characters (including newlines and other content)
      this.add("TEXT", char, start, start + 1);
      this.advancePosition(1);
      continue;
    }

    return this.tokens;
  }
}
