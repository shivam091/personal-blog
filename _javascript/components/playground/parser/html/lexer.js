import { BaseLexer } from "../base-lexer";
import { htmlTokens } from "./constants";

export class HtmlLexer extends BaseLexer {
  run() {
    const s = this.input;

    while (!this.eof()) {
      const char = this.peekChar(); // Peek at the current character
      const start = this.pos; // Token start position

      // 1. Comment
      if (s.startsWith(htmlTokens.commentStart, this.pos)) {
        // Find '-->' starting after the initial '<!--'
        const end = s.indexOf(htmlTokens.commentEnd, this.pos + 4);
        let j = this.length;
        if (end === -1) {
          // Unclosed HTML comment
          this.lexerError("Unclosed HTML comment: Expected '-->'", start, this.length);
        } else {
          // Closed comment
          j = end + 3;
        }

        this.add("COMMENT", s.slice(start, j), start, j, "cp-token-comment");
        this.advancePosition(j - start);
        continue;
      }

      // 2. Opening Tag / Closing Tag
      if (char === htmlTokens.tagStart) {
        // Check if it's an end tag: '</'
        if (this.peekChar(1) === "/") {
          let j = this.pos + 2; // Start looking after '</'
          while (j < this.length && s[j] !== htmlTokens.tagEnd) j++;

          const tagValue = s.slice(start, j + 1);
          this.add("TAG_CLOSE", tagValue, start, j + 1, "cp-token-tag");
          this.advancePosition(tagValue.length);
          continue;
        }

        // Check for a regular opening tag: '<' followed by a letter/name
        if (/[A-Za-z]/.test(this.peekChar(1))) {
          let j = this.pos + 1;
          // Scan until the closing '>' or EOF
          while (j < this.length && s[j] !== htmlTokens.tagEnd) j++;

          const tagValue = s.slice(start, j + 1);
          this.add("TAG_OPEN", tagValue, start, j + 1, "cp-token-tag");
          this.advancePosition(tagValue.length);
          continue;
        }
      }

      // 3. Whitespace
      if (char === " ") {
        this.add("WHITESPACE", char, start, start + 1, "editor-token-space");
        this.advancePosition(1);
        continue;
      }

      // 4. Tab
      if (char === "\t") {
        this.add("TAB", char, start, start + 1, "editor-token-tab");
        this.advancePosition(1);
        continue;
      }

      // 5. Ignore all other characters (Newlines, text content, unhandled symbols)
      this.advancePosition(1);
    }

    return this.tokens;
  }
}
