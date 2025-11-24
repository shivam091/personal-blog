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
    // Identifiers for tags and attributes
    while (this.pos < this.length && /[a-zA-Z0-9_-]/.test(this.input[this.pos])) {
      this.pos++;
    }
    return this.input.slice(start, this.pos);
  }

  readUnquotedValue() {
    const start = this.pos;
    // Unquoted values can contain letters, numbers, hyphens, and dots, but cannot contain
    // spaces, quotes, <, >, or =
    while (this.pos < this.length && /[a-zA-Z0-9._-]/.test(this.input[this.pos])) {
      this.pos++;
    }
    return this.input.slice(start, this.pos);
  }

  readEntity() {
      const start = this.pos;
      if (this.input[start] !== '&') return null;

      let currentPos = start + 1; // Start after '&'

      // Entity must be followed by letters/numbers/hash
      if (!/[a-zA-Z#]/.test(this.input[currentPos])) return null;

      // Scan until semicolon or end of input
      while (currentPos < this.length && this.input[currentPos] !== ';') {
          currentPos++;
      }

      // Check if we found a semicolon
      if (this.input[currentPos] === ';') {
          currentPos++; // Consume ';'
          const entity = this.input.slice(start, currentPos);

          // 🚨 NEW VALIDATION: Check if the entity is in the allowed set
          if (htmlTokens.entities.has(entity)) {
            this.add("ENTITY", entity, start, currentPos, "cp-token-entity");
            this.pos = currentPos;
            return true;
          }
      }

      // If invalid entity or unclosed sequence, reset position and treat as content later
      this.pos = start;
      return false;
  }


  run() {
    const s = this.input;
    const L = s.length;

    while (this.pos < L) {
      const i = this.pos;

      // 1. Comment
      if (s.startsWith(htmlTokens.commentStart, i)) {
        const end = s.indexOf("-->", i + 4);
        const j = end === -1 ? L : end + 3;
        this.add("COMMENT", s.slice(i, j), i, j, "cp-token-comment");
        this.pos = j;
        continue;
      }

      // 2. Structural Tag Handling
      if (s[i] === htmlTokens.tagStart) {
        let initialPos = this.pos;
        this.pos++; // Consume '<'

        let isClosingTag = s[this.pos] === '/';

        if (isClosingTag) {
            this.pos++; // Consume '/'
        }

        // Read Tag Name
        const nameStart = this.pos;
        let tagName = this.readIdentifier();

        // 🚨 CRITICAL VALIDATION CHECK 🚨
        // Only proceed if a valid identifier was read AND it is in the allowed list
        if (tagName.length > 0 && htmlTokens.tags.has(tagName)) {

            let tagType = isClosingTag ? "TAG_CLOSE" : "TAG_OPEN";

            // Tokenize the tag content found so far (e.g., `<div`, `</div`)
            this.add(tagType, s.slice(initialPos, this.pos), initialPos, this.pos, "cp-token-tag");

            // --- Tokenize Attributes (Only for opening tags) ---
            if (!isClosingTag) {

              let inTag = true;
              while (this.pos < L && inTag) {
                const attrStart = this.pos;
                this.skipWhitespace();

                if (s[this.pos] === htmlTokens.tagEnd) { inTag = false; break; }
                if (s[this.pos] === '/') { this.pos++; continue; } // Consume '/' for self-closing

                const identifierStart = this.pos;
                const attrName = this.readIdentifier();

                if (attrName.length > 0) {
                  const cls = htmlTokens.attributes.has(attrName) ? 'cp-token-attribute' : 'cp-token-variable';
                  this.add('ATTRIBUTE_NAME', attrName, identifierStart, this.pos, cls);

                  this.skipWhitespace();

                  // Check for '=' and value
                  if (s[this.pos] === '=') {
                    this.add('PUNCTUATION', '=', this.pos, this.pos + 1, "cp-token-punctuation");
                    this.pos++;
                    this.skipWhitespace();

                    const quote = s[this.pos];
                    const valueStart = this.pos;
                    let value = '';

                    if (quote === '\'' || quote === '"') {
                      // 1. Quoted Value
                      this.pos++; // Consume opening quote

                      // Read value until matching quote or newline
                      while (this.pos < L && s[this.pos] !== quote && s[this.pos] !== '\n') {
                        this.pos++;
                      }

                      if (s[this.pos] === quote) {
                        this.pos++; // Consume closing quote
                      }
                      value = s.slice(valueStart, this.pos);
                      this.add('ATTRIBUTE_VALUE_QUOTED', value, valueStart, this.pos, "cp-token-string");

                    } else {
                      // 2. Unquoted Value
                      const unquotedValue = this.readUnquotedValue();
                      if (unquotedValue.length > 0) {
                        value = unquotedValue;
                        this.add('ATTRIBUTE_VALUE_UNQUOTED', value, valueStart, this.pos, "cp-token-string");
                      }
                    }
                  }
                } else {
                  // Consume one character if we couldn't parse an identifier
                  if (s[this.pos] !== htmlTokens.tagEnd) this.pos++;
                }
              }
            }

            // --- Tokenize the final tag end bracket ---
            if (s[this.pos] === htmlTokens.tagEnd) {
                this.add('PUNCTUATION', htmlTokens.tagEnd, this.pos, this.pos + 1, "cp-token-tag");
                this.pos++;
            }

            continue; // Tag successfully parsed

        } else {
            // Not a valid tag name. Treat '<' as plain content/junk.
            this.pos = initialPos + 1;
        }
      }

      // 3. HTML Entity Check (MUST come before CONTENT)
      if (s[i] === '&') {
          if (this.readEntity()) {
              continue;
          }
          // If readEntity failed (e.g., invalid entity),
          // it falls through to be treated as plain content below.
      }


      // 4. Plain Content / Ignore everything else
      let contentStart = this.pos;
      // Content runs until the next '<' (tag start) or '&' (entity start)
      while(this.pos < L && s[this.pos] !== '<' && s[this.pos] !== '&') {
          this.pos++;
      }
      if (this.pos > contentStart) {
          this.add("CONTENT", s.slice(contentStart, this.pos), contentStart, this.pos, "cp-token-content");
      }
      if(this.pos === contentStart) {
          this.pos++; // Advance if stuck
      }
    }

    return this.tokens;
  }
}
