import { BaseLexer } from "../base-lexer";
import { htmlTokens } from "./constants";

export class HtmlLexer extends BaseLexer {
  run() {
    const s = this.input;

    while (!this.eof()) {
      const char = this.peekChar(); // Peek at the current character
      const start = this.pos; // Token start position

      // 1. Comment
      if (s.startsWith("<!--", this.pos)) {
        // Find '-->' starting after the initial '<!--'
        const end = s.indexOf("-->", this.pos + 4);
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
      if (char === "<") {
        // Check if it's an end tag: '</'
        if (this.peekChar(1) === "/") {
          let j = this.pos + 2; // Start looking after '</'
          while (j < this.length && s[j] !== ">") j++;

          const tagValue = s.slice(start, j + 1);
          this.add("TAG_CLOSE", tagValue, start, j + 1, "cp-token-tag");
          this.advancePosition(tagValue.length);
          continue;
        }

        // Check for a regular opening tag: '<' followed by a letter/name
        if (/[A-Za-z]/.test(this.peekChar(1))) {
          let j = this.pos + 1;
          // Scan until the closing '>' or EOF
          while (j < this.length && s[j] !== ">") j++;

          const tagValue = s.slice(start, j + 1);
          this.add("TAG_OPEN", tagValue, start, j + 1, "cp-token-tag");
          this.advancePosition(tagValue.length);
          continue;
        }
      }

      // 3. Whitespace
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

      // 4. Ignore all other characters (Newlines, text content, unhandled symbols)
      this.add("TEXT", char, start, start + 1);
      this.advancePosition(1);
    }

    return this.tokens;
  }
}
