import { BaseLexer } from "../base-lexer";
import { htmlTokens } from "./constants";

export class HtmlLexer extends BaseLexer {

  // --- Helper Methods ---

  isWhitespace(c) {
    return c === ' ' || c === '\t' || c === '\n' || c === '\r';
  }

  // NOTE: skipWhitespace is now primarily for internal helper use, not general token consumption
  skipWhitespace() {
    while (!this.eof() && this.isWhitespace(this.peekChar())) {
      this.advancePosition(1);
    }
  }

  /**
   * Consumes and tokenizes single whitespace characters (Space, Tab, Newline, Return)
   * if the current character is a whitespace.
   * @returns {boolean} True if a whitespace token was added, false otherwise.
   */
  tokenizeSingleWhitespace() {
      const char = this.peekChar();
      const start = this.pos;

      if (char === ' ') {
          this.add("SPACE", char, start, start + 1, "editor-token-space");
          this.advancePosition(1);
          return true;
      }
      if (char === '\t') {
          this.add("TAB", char, start, start + 1, "editor-token-tab");
          this.advancePosition(1);
          return true;
      }
      if (char === '\n' || char === '\r') {
          // Tokenize Newlines (usually as NEWLINE token, though not explicitly in original code outside tag)
          // Since the prompt focuses on spaces/tabs in tags, let's treat these as SPACE inside tags
          // and let the Content rule handle them outside tags for now.
          // For consistency with the general tokenization at the end, let's stick to SPACE/TAB for now.
          return false; // Let the general loop handle multi-line content if needed.
      }
      return false;
  }

  // Reads identifier and advances position
  readIdentifier() {
    const start = this.pos;
    while (!this.eof() && /[a-zA-Z0-9_-]/.test(this.peekChar())) {
      this.advancePosition(1);
    }
    return this.input.slice(start, this.pos);
  }

  // Reads unquoted value and advances position
  readUnquotedValue() {
    const start = this.pos;
    while (!this.eof() && /[a-zA-Z0-9._-]/.test(this.peekChar())) {
      this.advancePosition(1);
    }
    return this.input.slice(start, this.pos);
  }

  run() {
    const s = this.input;

    while (!this.eof()) {
      const char = this.peekChar();
      const start = this.pos;

      // 1. Comment ()
      if (s.startsWith(htmlTokens.commentStart, start)) {
        const end = s.indexOf("-->", start + 4);
        let j = this.length;

        if (end === -1) {
          this.lexerError("Unclosed HTML comment", start, this.length);
        } else {
          j = end + 3;
        }

        this.add("COMMENT", s.slice(start, j), start, j, "cp-token-comment");
        this.advancePosition(j - start);
        continue;
      }

      // 2. CDATA (<![CDATA[ ]]> )
      if (s.startsWith(htmlTokens.cdataStart, start)) {
        const end = s.indexOf("]]>", start + htmlTokens.cdataStart.length);
        let j = this.length;

        if (end === -1) {
           this.lexerError("Unclosed CDATA section", start, this.length);
        } else {
           j = end + 3;
        }

        this.add("CDATA", s.slice(start, j), start, j, "cp-token-cdata");
        this.advancePosition(j - start);
        continue;
      }

      // 3. Processing Instruction (<? ?>)
      if (s.startsWith(htmlTokens.piStart, start)) {
        const end = s.indexOf("?>", start + htmlTokens.piStart.length);
        let j = this.length;

        if (end === -1) {
             this.lexerError("Unclosed Processing Instruction", start, this.length);
        } else {
             j = end + 2;
        }

        this.add("PROCESSING_INSTRUCTION", s.slice(start, j), start, j, "cp-token-entity");
        this.advancePosition(j - start);
        continue;
      }

      // 4. Structural Tag Handling and DOCTYPE (Starts with '<')
      if (char === htmlTokens.tagStart) {
        // 4a. DOCTYPE
        if (s.slice(start).toUpperCase().startsWith(htmlTokens.doctypeStart.toUpperCase())) {
          const end = s.indexOf(">", start + htmlTokens.doctypeStart.length);
          const j = end === -1 ? this.length : end + 1;

          this.add("DOCTYPE", s.slice(start, j), start, j, "cp-token-keyword");
          this.advancePosition(j - start);
          continue;
        }

        // 4b. Regular Tag Logic
        // We speculatively parse to see if it's a valid tag.
        // If it is NOT a valid tag, we do NOT advance here, allowing it to fall through to CONTENT.

        // Store current position to backtrack if needed (conceptually, though we just won't 'continue' loop)
        const tagStartPos = this.pos;
        let currentPos = this.pos + 1; // Consume '<'

        let isClosingTag = false;
        if (s[currentPos] === '/') {
          isClosingTag = true;
          currentPos++;
        }

        // Peek ahead to read tag name without modifying `this.pos` yet
        let nameStart = currentPos;
        while (currentPos < this.length && /[a-zA-Z0-9_-]/.test(s[currentPos])) {
          currentPos++;
        }
        const tagName = s.slice(nameStart, currentPos);
        let hasTrailingSlash = false; // Flag for self-closing tags

        // 🚨 CRITICAL VALIDATION CHECK 🚨
        if (tagName.length > 0 && htmlTokens.tags.has(tagName)) {
          // It IS a valid tag. Now we commit to tokenizing it.

          // 1. Advance base pos to after the tag name
          this.pos = currentPos;
          const tagType = isClosingTag ? "TAG_CLOSE" : "TAG_OPEN";

          // Add the tag open token (e.g., "<div" or "</div")
          this.add(tagType, s.slice(tagStartPos, this.pos), tagStartPos, this.pos, "cp-token-tag");

          // 2. Tokenize Attributes (Only for opening tags)
          if (!isClosingTag) {
            let inTag = true;

            while (!this.eof() && inTag) {
              const loopStartPos = this.pos; // For infinite loop detection

              // NEW LOGIC: Tokenize single space/tab characters here
              if (this.tokenizeSingleWhitespace()) {
                  // If we consumed a whitespace, immediately continue the loop
                  continue;
              }

              const char = this.peekChar();

              if (char === htmlTokens.tagEnd) {
                inTag = false;
                break;
              }

              // Handle the optional trailing slash for self-closing tags (e.g., <br />)
              if (char === '/') {
                hasTrailingSlash = true;
                this.add('TAG_CLOSING_SLASH', '/', this.pos, this.pos + 1, "cp-token-tag");
                this.advancePosition(1); // Consume '/'
                continue;
              }

              // Attribute Name
              const identifierStart = this.pos;
              const attrName = this.readIdentifier();

              if (attrName.length > 0) {
                const cls = htmlTokens.attributes.has(attrName) ? 'cp-token-attribute' : 'cp-token-variable';
                this.add('ATTRIBUTE_NAME', attrName, identifierStart, this.pos, cls);

                // If we tokenized an attribute, we should now expect a space, /, or =.
                // Whitespace is handled by the `tokenizeSingleWhitespace` at the loop start.

                // Attribute Value assignment
                if (this.peekChar() === '=') {
                  this.add('PUNCTUATION', '=', this.pos, this.pos + 1, "cp-token-punctuation");
                  this.advancePosition(1); // consume '='

                  // Whitespace after '=' must be skipped (or tokenized one by one) before value
                  while (this.tokenizeSingleWhitespace()) { /* Tokenize all whitespaces */ }

                  const valQuote = this.peekChar();
                  const valStart = this.pos;

                  if (valQuote === '\'' || valQuote === '"') {
                    // Quoted Value
                    this.advancePosition(1); // consume open quote

                    while (!this.eof() && this.peekChar() !== valQuote && this.peekChar() !== '\n') {
                      this.advancePosition(1);
                    }

                    if (this.peekChar() === valQuote) {
                      this.advancePosition(1); // consume close quote
                      const value = s.slice(valStart, this.pos);
                      this.add('ATTRIBUTE_VALUE_QUOTED', value, valStart, this.pos, "cp-token-string");
                    } else {
                      // Error: Unclosed string
                      this.lexerError(`Unclosed attribute value: Expected ${valQuote}`, valStart, this.pos);
                      this.add('ERROR_STRING', s.slice(valStart, this.pos), valStart, this.pos, "cp-token-error");
                    }
                  } else {
                    // Unquoted Value
                    const unquotedValue = this.readUnquotedValue();
                    if (unquotedValue.length > 0) {
                      this.add('ATTRIBUTE_VALUE_UNQUOTED', unquotedValue, valStart, this.pos, "cp-token-string");
                    }
                  }
                }
              } else {
                // Stuck in loop check (prevent infinite loop if junk found inside tag)
                // Only advance if we haven't consumed anything (no whitespace, no identifier)
                // and we are not at the end of tag
                if (this.pos === loopStartPos && this.peekChar() !== htmlTokens.tagEnd) {
                  this.advancePosition(1);
                }
              }
            }
          }

          // 3. Tokenize the final tag end bracket '>'
          if (this.peekChar() === htmlTokens.tagEnd) {
            // Use new token type for self-closing tag end
            const tokenType = isClosingTag ? 'PUNCTUATION' :
                            (hasTrailingSlash ? 'TAG_SELF_CLOSE_END' : 'PUNCTUATION');

            this.add(tokenType, htmlTokens.tagEnd, this.pos, this.pos + 1, "cp-token-tag");
            this.advancePosition(1);
          }

          continue; // Tag successfully parsed
        }
      }

      // 5. HTML Entity Check (&copy;)
      if (char === '&') {
        let currentPos = start + 1;
        if (currentPos < this.length && /[a-zA-Z#]/.test(s[currentPos])) {
            while (currentPos < this.length && s[currentPos] !== ';') {
                currentPos++;
            }

            if (currentPos < this.length && s[currentPos] === ';') {
                currentPos++; // Consume ';'
                const entity = s.slice(start, currentPos);

                if (htmlTokens.entities.has(entity)) {
                    this.add("ENTITY", entity, start, currentPos, "cp-token-entity");
                    this.advancePosition(currentPos - start);
                    continue;
                }
            }
        }
        // If invalid entity, fall through to CONTENT
      }

      // 6. Whitespace (Standalone Space or Tab)
      if (char === ' ') {
          this.add("SPACE", char, start, start + 1, "editor-token-space");
          this.advancePosition(1);
          continue;
      }
      if (char === '\t') {
          this.add("TAB", char, start, start + 1, "editor-token-tab");
          this.advancePosition(1);
          continue;
      }

      // 7. Newline/Carriage Return (Handled as content boundary for now)

      // 8. Content / Text / Junk
      // We consume everything until we hit a boundary character (<, &, space, tab)
      let contentEnd = start + 1;

      while (contentEnd < this.length) {
          const c = s[contentEnd];

          // Break on boundaries
          if (c === '<' || c === '&' || c === ' ' || c === '\t') {
              // Special case: `<?` is also a boundary
              if (c === '<' && s[contentEnd+1] === '?') break;
              break;
          }
          contentEnd++;
      }

      const content = s.slice(start, contentEnd);

      // If the content is just a newline, we can tokenise it specifically if required.
      // Keeping it simple as CONTENT for now based on the existing structure.
      if (content.length > 0) {
        // this.add("CONTENT", content, start, contentEnd, "cp-token-content");
        // this.advancePosition(contentEnd - start);
      } else {
         // Should not happen if contentEnd > start
      }
      this.advancePosition(1);
    }

    return this.tokens;
  }
}
