import { BaseLexer } from "../base-lexer";
import { cssTokens } from "./tokens";

export class CssLexer extends BaseLexer {
  run() {
    const s = this.input;

    while (!this.eof()) {
      const char = this.peekChar(); // Peek at the current character
      const start = this.pos; // Token start position

      // 1. Multi-line Comment
      if (this.input.startsWith(cssTokens.commentStart, this.pos)) {
        const end = this.input.indexOf(cssTokens.commentEnd, this.pos + cssTokens.commentStart.length);

        // Open
        this.add("COMMENT_OPEN", cssTokens.commentStart, start, start + cssTokens.commentStart.length, "token-comment");
        this.advancePosition(cssTokens.commentStart.length);

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
          this.add("COMMENT_CLOSE", cssTokens.commentEnd, end, end + cssTokens.commentEnd.length, "token-comment");
          this.advancePosition(cssTokens.commentEnd.length);
        } else {
          this.lexerError(`Unclosed comment: Expected '${cssTokens.commentEnd}'`, start, this.length);
        }
        continue;
      }

      // 2. Whitespace (explicitly handle standard space and other non-newline whitespace)
      if (/\s/.test(char) && char !== "\n" && char !== "\r" && char !== "\t") {
        this.add("WHITESPACE", char, start, start + 1, "token-space");
        this.advancePosition(1);
        continue;
      }

      // 3. Tab
      if (char === "\t") {
        this.add("TAB", char, start, start + 1, "token-tab");
        this.advancePosition(1);
        continue;
      }

      // 4. Newline
      if (char === "\n" || char === "\r") {
        this.add("NEWLINE", char, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 5. Block Open
      if (char === cssTokens.braceStart) {
        this.add("BLOCK_OPEN", cssTokens.braceStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 6. Block Close
      if (char === cssTokens.braceEnd) {
        this.add("BLOCK_CLOSE", cssTokens.braceEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 7. Parenthesis open
      if (char === cssTokens.functionStart) {
        this.add("PAREN_OPEN", cssTokens.functionStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 8. Parenthesis close
      if (char === cssTokens.functionEnd) {
        this.add("PAREN_CLOSE", cssTokens.functionEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 9. Ignore all other characters (including newlines and other content)
      this.add("TEXT", char, start, start + 1);
      this.advancePosition(1);
      continue;
    }

    return this.tokens;
  }
}
