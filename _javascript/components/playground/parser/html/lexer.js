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
        this.consumeMultiLineComment(htmlTokens.commentStart, htmlTokens.commentEnd);
        continue;
      }

      // 2. Closing Tag: </tag>
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

      // 3. Opening Tag: <tag ...>
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

      // 4. HTML Entity Check (&copy;)
      if (char === "&") {
        let currentPos = start + 1;
        if (currentPos < this.length && /[a-zA-Z#]/.test(s[currentPos])) {
          while (currentPos < this.length && s[currentPos] !== ";") {
            currentPos++;
          }

          if (currentPos < this.length && s[currentPos] === ";") {
            currentPos++; // Consume ';'
            const entity = s.slice(start, currentPos);

            if (htmlTokens.entities.has(entity)) {
              this.add("ENTITY", entity, start, currentPos, "token-entity");
              this.advancePosition(currentPos - start);
              continue;
            }
          }
        }
        // If invalid entity, fall through to CONTENT
      }

      // 4. Whitespace
      if (this.handleWhitespace()) continue;

      // 5. Ignore all other characters (Newlines, text content, unhandled symbols)
      this.add("TEXT", char, start, start + 1);
      this.advancePosition(1);
      continue;
    }

    return this.tokens;
  }
}
