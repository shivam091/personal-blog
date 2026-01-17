import { BaseLexer } from "../base-lexer";
import { jsTokens } from "./tokens";

export class JsLexer extends BaseLexer {
  static STATIC_TOKENS = {
    "{": "BLOCK_OPEN",
    "}": "BLOCK_CLOSE",
    "(": "PAREN_OPEN",
    ")": "PAREN_CLOSE",
    "[": "BRACKET_OPEN",
    "]": "BRACKET_CLOSE"
  };
  static KEYS = Object.keys(JsLexer.STATIC_TOKENS).sort((a, b) => b.length - a.length);

  run() {
    const s = this.input;

    while (!this.eof()) {
      const char = this.peekChar(); // Peek at the current character
      const start = this.pos; // Capture start position

      // 1. Multi-line Comment
      if (this.input.startsWith(jsTokens.commentStart, this.pos)) {
        this.consumeMultiLineComment(jsTokens.commentStart, jsTokens.commentEnd);
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

      // 3. Static tokens
      if (this.handleStaticTokens(JsLexer.STATIC_TOKENS, JsLexer.KEYS)) continue;

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
