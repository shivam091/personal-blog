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

      if (!/[a-zA-Z#]/.test(this.input[currentPos])) return null;

      while (currentPos < this.length && this.input[currentPos] !== ';') {
          currentPos++;
      }

      if (this.input[currentPos] === ';') {
          currentPos++; // Consume ';'
          const entity = this.input.slice(start, currentPos);

          if (htmlTokens.entities.has(entity)) {
            this.add("ENTITY", entity, start, currentPos, "cp-token-entity");
            this.pos = currentPos;
            return true;
          }
      }

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

      // 2. CDATA
      if (s.startsWith(htmlTokens.cdataStart, i)) {
          const end = s.indexOf("]]>", i + htmlTokens.cdataStart.length);
          const j = end === -1 ? L : end + 3;
          this.add("CDATA", s.slice(i, j), i, j, "cp-token-cdata");
          this.pos = j;
          continue;
      }

      // 3. Processing Instruction (PI)
      if (s.startsWith(htmlTokens.piStart, i)) {
          const end = s.indexOf("?>", i + htmlTokens.piStart.length);
          const j = end === -1 ? L : end + 2; // +2 for '?>'
          this.add("PROCESSING_INSTRUCTION", s.slice(i, j), i, j, "cp-token-entity");
          this.pos = j;
          continue;
      }


      // 4. Structural Tag Handling and DOCTYPE (both start with '<')
      if (s[i] === htmlTokens.tagStart) {

        // 4a. DOCTYPE check (must be uppercase to match spec)
        if (s.toUpperCase().startsWith(htmlTokens.doctypeStart.toUpperCase(), i)) {
            const end = s.indexOf(">", i + htmlTokens.doctypeStart.length);
            const j = end === -1 ? L : end + 1;
            this.add("DOCTYPE", s.slice(i, j), i, j, "cp-token-keyword");
            this.pos = j;
            continue;
        }

        // 4b. Regular Tag Logic starts here
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
        if (tagName.length > 0 && htmlTokens.tags.has(tagName)) {

            let tagType = isClosingTag ? "TAG_CLOSE" : "TAG_OPEN";

            // Tokenize the tag content found so far (e.g., `<div`, `</div`)
            this.add(tagType, s.slice(initialPos, this.pos), initialPos, this.pos, "cp-token-tag");

            // --- Tokenize Attributes (Only for opening tags) ---
            if (!isClosingTag) {

              let inTag = true;
              while (this.pos < L && inTag) {
                const attrStart = this.pos;
                this.skipWhitespace(); // Still skip whitespace inside tag definition

                if (s[this.pos] === htmlTokens.tagEnd) { inTag = false; break; }
                if (s[this.pos] === '/') { this.pos++; continue; }

                const identifierStart = this.pos;
                const attrName = this.readIdentifier();

                if (attrName.length > 0) {
                  const cls = htmlTokens.attributes.has(attrName) ? 'cp-token-attribute' : 'cp-token-variable';
                  this.add('ATTRIBUTE_NAME', attrName, identifierStart, this.pos, cls);

                  this.skipWhitespace();

                  if (s[this.pos] === '=') {
                    this.add('PUNCTUATION', '=', this.pos, this.pos + 1, "cp-token-punctuation");
                    this.pos++;
                    this.skipWhitespace();

                    const quote = s[this.pos];
                    const valueStart = this.pos;
                    let value = '';

                    if (quote === '\'' || quote === '"') {
                      // 1. Quoted Value
                      this.pos++;

                      while (this.pos < L && s[this.pos] !== quote && s[this.pos] !== '\n') {
                        this.pos++;
                      }

                      if (s[this.pos] === quote) {
                        this.pos++;
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
            // Not a valid tag name, DOCTYPE, or PI, treat '<' as plain content/junk.
            this.pos = initialPos + 1;
        }
      }

      // 5. HTML Entity Check (MUST come before CONTENT)
      if (s[i] === '&') {
          if (this.readEntity()) {
              continue;
          }
      }


      // 6. Plain Content / Whitespace Tokenization (Refactored)
      let contentStart = this.pos;

      // This loop will break when a tag boundary, entity, space, or tab is found.
      while(this.pos < L) {
          const char = s[this.pos];

          // Boundary check (Start of Tag, PI, Entity)
          if (char === '<' || char === '&' || char === htmlTokens.piStart[0]) {
              break;
          }

          // Check for specific tokenizable whitespace: space
          if (char === ' ') {
              if (this.pos > contentStart) {
                  // Tokenize any CONTENT (including newlines) built up so far
                  this.add("CONTENT", s.slice(contentStart, this.pos), contentStart, this.pos, "cp-token-content");
              }
              // Tokenize the space
              this.add("SPACE", char, this.pos, this.pos + 1, "editor-token-space");
              this.pos++;
              contentStart = this.pos; // Reset content start
              continue;
          }

          // Check for specific tokenizable whitespace: tab
          if (char === '\t') {
              if (this.pos > contentStart) {
                  // Tokenize any CONTENT (including newlines) built up so far
                  this.add("CONTENT", s.slice(contentStart, this.pos), contentStart, this.pos, "cp-token-content");
              }
              // Tokenize the tab
              this.add("TAB", char, this.pos, this.pos + 1, "editor-token-tab");
              this.pos++;
              contentStart = this.pos; // Reset content start
              continue;
          }

          // If it's not a boundary, space, or tab, it's general content (e.g., text, newlines)
          this.pos++;
      }

      // Tokenize any remaining CONTENT
      if (this.pos > contentStart) {
          this.add("CONTENT", s.slice(contentStart, this.pos), contentStart, this.pos, "cp-token-content");
      }

      if(this.pos === i) {
          this.pos++; // Advance if stuck
      }
    }

    return this.tokens;
  }
}
