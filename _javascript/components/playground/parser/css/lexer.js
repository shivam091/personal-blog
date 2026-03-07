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

      // 9. Custom properties (variables)
      if (s.startsWith("--", this.pos)) {
        const propStart = this.pos;
        this.advancePosition(2); // Consume the initial '--'

        let j = this.pos; // j is now pointing to the character after '--'

        // CSS custom properties allow any valid identifier characters, including digits
        // right after the initial --
        while (j < this.length && /[a-zA-Z0-9_\-]/.test(s[j])) {
          j++;
        }

        const value = s.slice(propStart, j);

        // A valid custom property must be longer than just '--'
        if (value.length > 2) {
          this.add("CUSTOM_PROPERTY", value, propStart, j, "token-variable");
          this.advancePosition(j - this.pos); // Advance past the identifier part
          continue;
        }

        this.lexerError("Invalid CSS custom property: Name expected after '--'", propStart, j);
        this.add("ERROR_TOKEN", value, propStart, j, "token-error");
        this.advancePosition(j - this.pos);
        continue;
      }

      // 10. Numbers & Units
      const substring = s.slice(this.pos);
      const numberMatch = substring.match(new RegExp(cssTokens.numberRegex));

      if (numberMatch) {
        const numberValue = numberMatch[0];
        const numberEnd = start + numberValue.length;

        // Tokenize the NUMBER part
        this.add("NUMBER", numberValue, start, numberEnd, "token-number");
        this.advancePosition(numberValue.length);

        // Now, check for an immediate unit after the number
        const unitStart = numberEnd;
        let unitEnd = numberEnd;

        // Find the longest matching unit
        let bestMatch = null;

        // CSS units are generally short (2-4 chars), so a simple check is fine.
        // We iterate through the UNITS set to find a match starting at unitStart.
        for (const unit of cssTokens.units) {
          if (substring.startsWith(unit, numberValue.length)) {
            if (!bestMatch || unit.length > bestMatch.length) {
              bestMatch = unit;
            }
          }
        }

        if (bestMatch) {
          unitEnd = unitStart + bestMatch.length;
          const unitValue = s.slice(unitStart, unitEnd);

          // Tokenize the UNIT part
          this.add("UNIT", unitValue, unitStart, unitEnd, "token-unit");
          this.advancePosition(unitValue.length);
        }

        // Number and optional unit processed, continue the main loop
        continue;
      }

      // 11. Hex Color Codes and ID Selectors
      if (char === "#") {
        const hashStart = this.pos;
        const hashSubstring = s.slice(this.pos + 1);

        // Try to match as a Hex Color Code
        const hexMatch = hashSubstring.match(cssTokens.hexColorCodeRegex);

        if (hexMatch) {
          const hexValue = "#" + hexMatch[0];
          const hexEnd = hashStart + hexValue.length;

          this.add("HEX_COLOR", hexValue, hashStart, hexEnd, "token-color");
          this.advancePosition(hexValue.length);
          continue;
        }

        // If not a hex code, try to match as an ID Selector.
        // Check the character immediately following '#'
        const identifierStartChar = this.peekChar(1);

        if (identifierStartChar && (/[a-zA-Z_\-]/.test(identifierStartChar) || /[\u0080-\uffff]/.test(identifierStartChar))) {
          let idEnd = this.pos + 1; // Start looking *after* the '#'

          // Consume the identifier characters (letters, numbers, underscores, hyphens)
          while (idEnd < this.length && /[a-zA-Z0-9_\-]/.test(s[idEnd])) {
            idEnd++;
          }

          // ID selector: # followed by identifier characters.
          const idValue = s.slice(hashStart, idEnd);

          // Check to ensure we consumed more than just the '#' itself.
          if (idValue.length > 1) {
            this.add("ID_SELECTOR", idValue, hashStart, idEnd, "token-selector");
            this.advancePosition(idEnd - hashStart); // Advance by the full token length
            continue;
          }
        }

        // If it failed both checks (Hex/ID), treat the '#' as UNKNOWN/TEXT for now.
        // This must be done manually since the UNKNOWN rule only groups from the *next* char.
        this.add("UNKNOWN", char, start, start + 1, "token-unknown");
        this.advancePosition(1);
        continue;
      }

      // 12. Pseudo-Classes/Elements
      if (char === ":") {
        const colonStart = this.pos;
        let colonCount = 1;
        this.advancePosition(1); // Consume the first ':'

        // Check for double colon (::) for Pseudo-Elements
        if (this.peekChar() === ":") {
          colonCount = 2;
          this.advancePosition(1); // Consume the second ':'
        }

        const identifierStart = this.pos;
        let identifierEnd = this.pos;

        // Consume the identifier characters that follow
        while (identifierEnd < this.length && /[a-zA-Z0-9_\-]/.test(s[identifierEnd])) {
          identifierEnd++;
        }

        const identifierValue = s.slice(identifierStart, identifierEnd);
        const tokenValue = s.slice(colonStart, identifierEnd);
        const tokenEnd = identifierEnd;

        // Ensure we actually found an identifier
        if (identifierValue.length > 0) {
          if (colonCount === 2) {
            // Check for Pseudo-Element
            if (cssTokens.pseudoElements.has(identifierValue)) {
              this.add("PSEUDO_ELEMENT", tokenValue, colonStart, tokenEnd, "token-pseudo-element");
              this.advancePosition(tokenEnd - identifierStart); // Advance past the identifier
              continue;
            }
          } else {
            // Check for Pseudo-Class
            if (cssTokens.pseudoClasses.has(identifierValue)) {
              this.add("PSEUDO_CLASS", tokenValue, colonStart, tokenEnd, "token-pseudo-class");
              this.advancePosition(tokenEnd - identifierStart); // Advance past the identifier
              continue;
            }
          }

          // If the identifier was found but not in the known list, treat it as an UNKNOWN pseudo.
          this.lexerError(`Unknown pseudo selector: ${tokenValue}`, colonStart, tokenEnd);
          this.add("ERROR_TOKEN", tokenValue, colonStart, tokenEnd, "token-error");
          this.advancePosition(tokenEnd - identifierStart); // Advance past the identifier
          continue;

        } else {
          // Error: Just ':' or '::' without a name (e.g., div: { } or div:: )
          const errorValue = s.slice(colonStart, this.pos);
          this.lexerError(`Incomplete pseudo selector: Identifier expected after '${errorValue}'`, colonStart, this.pos);
          this.add("ERROR_TOKEN", errorValue, colonStart, this.pos, "token-error");
          continue; // Position is already advanced past the colon(s)
        }
      }

      // 13. Ignore all other characters (including newlines and other content)
      this.add("TEXT", char, start, start + 1);
      this.advancePosition(1);
      continue;
    }

    return this.tokens;
  }
}
