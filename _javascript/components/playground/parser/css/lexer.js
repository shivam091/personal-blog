import { BaseLexer } from "../base-lexer";
import { cssTokens } from "./tokens";

export class CssLexer extends BaseLexer {
  static STATIC_TOKENS = {
    "{": "BLOCK_OPEN",
    "}": "BLOCK_CLOSE",
  };
  static KEYS = Object.keys(CssLexer.STATIC_TOKENS).sort((a, b) => b.length - a.length);

  run() {
    const s = this.input;

    while (!this.eof()) {
      const char = this.peekChar(); // Peek at the current character
      const start = this.pos; // Token start position

      // 1. Multi-line Comment
      if (this.input.startsWith(cssTokens.commentStart, this.pos)) {
        this.consumeMultiLineComment(cssTokens.commentStart, cssTokens.commentEnd);
        continue;
      }

      // 2. Static tokens
      if (this.handleStaticTokens(CssLexer.STATIC_TOKENS, CssLexer.KEYS)) continue;

      // 3. Whitespace
      if (this.handleWhitespace()) continue;

      // 4. Custom properties (variables)
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

      // 5. Numbers & Units
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

      // 6. Hex Color Codes and ID Selectors
      if (char === "#") {
        const hashStart = this.pos;
        const hashSubstring = s.slice(this.pos + 1);

        // 1. Try to match as a Hex Color Code
        const hexMatch = hashSubstring.match(cssTokens.hexColorCodeRegex);

        if (hexMatch) {
          const hexValue = "#" + hexMatch[0];
          const hexEnd = hashStart + hexValue.length;

          this.add("HEX_COLOR", hexValue, hashStart, hexEnd, "token-color");
          this.advancePosition(hexValue.length);
          continue;
        }

        // 2. If not a hex code, try to match as an ID Selector.
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

        // 3. If it failed both checks (Hex/ID), treat the '#' as UNKNOWN/TEXT for now.
        // This must be done manually since the UNKNOWN rule only groups from the *next* char.
        this.add("UNKNOWN", char, start, start + 1, "token-unknown");
        this.advancePosition(1);
        continue;
      }

      // 7. Ignore all other characters (including newlines and other content)
      this.add("TEXT", char, start, start + 1);
      this.advancePosition(1);
      continue;
    }

    return this.tokens;
  }
}
