import { BaseLexer } from "../base-lexer";
import { htmlTokens } from "./tokens";

export class HtmlLexer extends BaseLexer {
  run() {
    const s = this.input;

    while (!this.eof()) {
      const char = this.peekChar(); // Peek at the current character
      const start = this.pos; // Token start position

      // 1. Multi-line Comment
      if (this.input.startsWith(htmlTokens.commentStart, this.pos)) {
        const end = this.input.indexOf(htmlTokens.commentEnd, this.pos + htmlTokens.commentStart.length);

        // Open
        this.add("COMMENT_OPEN", htmlTokens.commentStart, start, start + htmlTokens.commentStart.length, "token-comment");
        this.advancePosition(htmlTokens.commentStart.length);

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
          this.add("COMMENT_CLOSE", htmlTokens.commentEnd, end, end + htmlTokens.commentEnd.length, "token-comment");
          this.advancePosition(htmlTokens.commentEnd.length);
        } else {
          this.lexerError(`Unclosed comment: Expected '${htmlTokens.commentEnd}'`, start, this.length);
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

      // 5. Closing Tag: </tag>
      if (char === htmlTokens.tagStart && this.peekChar(1) === "/") {
        let j = this.pos + 2;

        // Extract tag name
        const nameStart = j;
        while (j < this.length && /[A-Za-z0-9]/.test(s[j])) j++;
        const tagName = s.slice(nameStart, j).toLowerCase();

        // Must have valid HTML tag name
        if (!tagName || !htmlTokens.tags.has(tagName)) {
          // Not a valid tag -> treat first char "<" as TEXT
          this.add("TEXT", char, start, start + 1);
          this.advancePosition(1);
          continue;
        }

        // Must end with '>'
        if (s[j] !== htmlTokens.tagEnd) {
          // Not well formed → TEXT
          this.add("TEXT", char, start, start + 1);
          this.advancePosition(1);
          continue;
        }

        const tagValue = s.slice(start, j + 1);
        this.add("TAG_CLOSE", tagValue, start, j + 1, "token-tag");
        this.advancePosition(tagValue.length);
        continue;
      }

      // 6. Opening Tag: <tag ...>
      if (char === htmlTokens.tagStart && /[A-Za-z]/.test(this.peekChar(1))) {
        let j = this.pos + 1;

        // Extract tag name
        const nameStart = j;
        while (j < this.length && /[A-Za-z0-9]/.test(s[j])) j++;
        const tagName = s.slice(nameStart, j).toLowerCase();

        // Must be a known HTML tag
        if (!htmlTokens.tags.has(tagName)) {
          this.add("TEXT", char, start, start + 1);
          this.advancePosition(1);
          continue;
        }

        // Find end of tag
        while (j < this.length && s[j] !== ">") j++;

        if (j >= this.length) {
          this.lexerError(`Unclosed HTML tag <${tagName}>`, start, this.length);
        }

        const tagValue = s.slice(start, j + 1);
        this.add("TAG_OPEN", tagValue, start, j + 1, "token-tag");
        this.advancePosition(tagValue.length);
        continue;
      }

      // 7. Ignore all other characters (Newlines, text content, unhandled symbols)
      this.add("TEXT", char, start, start + 1);
      this.advancePosition(1);
      continue;
    }

    return this.tokens;
  }
}
