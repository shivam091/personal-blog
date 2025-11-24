import { BaseLexer } from "./../base-lexer";
import { htmlTokens } from "./constants";

export class HtmlLexer extends BaseLexer {
  isWhitespace(c) {
    return c === ' ' || c === '\t' || c === '\n' || c === '\r';
  }

  skipWhitespace() {
    while (this.pos < this.length && this.isWhitespace(this.input[this.pos])) {
      this.pos++;
    }
  }

  readIdentifier() {
    const start = this.pos;
    while (this.pos < this.length && /[a-zA-Z0-9_-]/.test(this.input[this.pos])) {
      this.pos++;
    }
    return this.input.slice(start, this.pos);
  }

  run() {
    const s = this.input;
    const L = s.length;

    while (this.pos < L) {
      const i = this.pos;

      // 1. Comment (Structural/Highlight)
      if (s.startsWith(htmlTokens.commentStart, i)) {
        const end = s.indexOf("-->", i + 4);
        const j = end === -1 ? L : end + 3;
        this.add("COMMENT", s.slice(i, j), i, j, "cp-token-comment");
        this.pos = j;
        continue;
      }

      // 2. Tag (Structural/Highlight)
      if (s[i] === htmlTokens.tagStart) {
        let j = i + 1;
        let isClosingTag = s[j] === '/';

        // --- Tokenize the opening bracket and slash/name ---
        this.pos++;
        const tagStartPos = this.pos;

        if (isClosingTag) {
            this.pos++; // Consume '/'
        }

        // Read Tag Name
        let tagName = this.readIdentifier();

        // Tokenize the tag content found so far (e.g., `<div`, `</div`)
        let tagType = isClosingTag ? "TAG_CLOSE" : "TAG_OPEN";
        this.add(tagType, s.slice(i, this.pos), i, this.pos, "cp-token-tag");

        // --- Tokenize Attributes (Only for opening tags) ---
        if (!isClosingTag) {
          // Stop parsing attributes when encountering the tag end or end of input
          while (this.pos < L && s[this.pos] !== htmlTokens.tagEnd) {
            const attrStart = this.pos;
            this.skipWhitespace();

            if (s[this.pos] === htmlTokens.tagEnd) break; // Break if we hit the end bracket
            if (this.pos >= L) break;

            const identifierStart = this.pos;
            const attrName = this.readIdentifier();

            if (attrName.length > 0) {
              const cls = htmlTokens.attributes.has(attrName) ? 'cp-token-attribute' : 'cp-token-variable';
              this.add('ATTRIBUTE_NAME', attrName, identifierStart, this.pos, cls);

              this.skipWhitespace();
              if (s[this.pos] === '=') {
                // Tokenize '='
                this.add('PUNCTUATION', '=', this.pos, this.pos + 1, "cp-token-punctuation");
                this.pos++;
                this.skipWhitespace();

                const quote = s[this.pos];
                if (quote === '\'' || quote === '"') {
                  const valueStart = this.pos;
                  this.pos++; // Consume opening quote

                  // Read value until matching quote
                  while (this.pos < L && s[this.pos] !== quote) {
                    this.pos++;
                  }

                  if (s[this.pos] === quote) {
                    this.pos++; // Consume closing quote
                  }

                  // Tokenize the full value string (including quotes)
                  this.add('ATTRIBUTE_VALUE', s.slice(valueStart, this.pos), valueStart, this.pos, "cp-token-string");
                }
              }
            } else {
              // Consume one character if we couldn't parse an identifier
              this.pos++;
            }
          }
        }

        // --- Tokenize the final tag end bracket ---
        if (s[this.pos] === htmlTokens.tagEnd) {
            this.add('PUNCTUATION', htmlTokens.tagEnd, this.pos, this.pos + 1, "cp-token-tag");
            this.pos++;
        }

        continue;
      }

      // 3. Plain Content / Ignore everything else
      this.pos++;
    }

    return this.tokens;
  }
}
