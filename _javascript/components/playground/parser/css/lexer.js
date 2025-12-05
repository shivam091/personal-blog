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

      // 4. Whitespace
      if (/\s/.test(char)) {
        let tokenType = "TEXT"; // Default fallback
        let tokenClass = undefined;

        if (char === " ") {
          // Case 9a: Standard Space
          tokenType = "WHITESPACE";
          tokenClass = "editor-token-space";
        } else if (char === "\t") {
          // Case 9b: Tab
          tokenType = "TAB";
          tokenClass = "editor-token-tab";
        } else if (char === "\n" || char === "\r") {
          // Case 9c: Newline (CR, LF, or CRLF start)
          tokenType = "NEWLINE";
        }

        // Handle the token
        this.add(tokenType, char, start, start + 1, tokenClass);
        this.advancePosition(1);
        continue;
      }

      // 5. Ignore all other characters (including newlines and other content)
      this.advancePosition(1);
    }

    return this.tokens;
  }
}
