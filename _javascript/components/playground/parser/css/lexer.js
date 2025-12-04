import { BaseLexer } from "../base-lexer";
import { cssTokens } from "./constants";

export class CssLexer extends BaseLexer {
  run() {
    const s = this.input;

    while (!this.eof()) {
      const char = this.peekChar(); // Peek at the current character
      const start = this.pos; // Token start position

      // 1. Multi-line Comment
      if (s.startsWith(cssTokens.commentStart, this.pos)) {
        const end = s.indexOf(cssTokens.commentEnd, this.pos + 2);
        let j = this.length;

        if (end === -1) {
          // Unclosed comment check.
          this.lexerError("Unclosed CSS comment: Expected '*/'", start, this.length);
        } else {
          // Closed comment
          j = end + 2;
        }

        this.add("COMMENT", s.slice(start, j), start, j, "cp-token-comment");
        this.advancePosition(j - start);
        continue;
      }

      // 2. Block Open
      if (char === cssTokens.braceStart) {
        this.add("BLOCK_OPEN", cssTokens.braceStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 3. Block Close
      if (char === cssTokens.braceEnd) {
        this.add("BLOCK_CLOSE", cssTokens.braceEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 4. Parenthesis open
      if (char === cssTokens.functionStart) {
        this.add("PAREN_OPEN", cssTokens.functionStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 5. Parenthesis close
      if (char === cssTokens.functionEnd) {
        this.add("PAREN_CLOSE", cssTokens.functionEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 6. String literals
      if (char === "'" || char === '"') {
        const quoteType = char;
        this.advancePosition(1); // Consume opening quote

        // Scan until the closing quote
        while (!this.eof() && this.peekChar() !== quoteType) {
          // Check for illegal newline inside unescaped string
          // if (this.peekChar() === "\n" || this.peekChar() === "\r") {
          //   this.lexerError(`Illegal newline in string literal: Expected '${quoteType}'`, start, this.pos);
          //   this.add("ERROR_STRING", s.slice(start, this.pos), start, this.pos, "cp-token-error");
          //   this.advancePosition(1); // Advance past the newline to recover
          //   continue;
          // }

          // Handle escaped characters (e.g., 'it\'s')
          if (this.peekChar() === "\\" && this.peekChar(1)) {
            this.advancePosition(2); // Consume '\' and the escaped character
            continue;
          }
          this.advancePosition(1);
        }

        const end = this.pos;

        // Check for closing quote
        if (this.peekChar() === quoteType) {
          this.advancePosition(1); // Consume closing quote
          this.add("STRING", s.slice(start, this.pos), start, this.pos, "cp-token-string");
        } else {
          // Unclosed string literal: treat content found so far as a string error
          this.lexerError(`Unclosed string literal: Expected '${quoteType}'`, start, end);
          this.add("ERROR_STRING", s.slice(start, end), start, end, "cp-token-error");
        }
        continue;
      }

      // 7. Whitespace
      if (char === " ") {
        this.add("WHITESPACE", char, start, start + 1, "editor-token-space");
        this.advancePosition(1);
        continue;
      }

      // 8. Tab
      if (char === "\t") {
        this.add("TAB", char, start, start + 1, "editor-token-tab");
        this.advancePosition(1);
        continue;
      }

      // 9. Comma (Used in selector lists, function arguments, etc.)
      if (char === ",") {
        this.add("COMMA", char, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 10. Semicolon
      if (char === ";") {
        this.add("SEMICOLON", char, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 11. Combinators (+, >, ~)
      if (char === "+" || char === ">") {
        // We must handle standalone '~' here because it can be a combinator but it's checked in
        // other rule with '='. If it fails there, the loop continues, and we need to check if
        // '~' is a combinator.
        this.add("COMBINATOR", char, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 12. Colon (Separates property: value, or starts a pseudo-selector)
      if (char === ":") {
        const nextChar = this.peekChar(1);

        // If followed by an identifier character or another colon, it's a pseudo-selector/element (Rule 13 handles it).
        if (nextChar === ":" || (nextChar && /[a-zA-Z_\-]/.test(nextChar))) {
          // Do nothing, fall through to Rule 13 (Pseudo-Classes/Elements)
        } else {
          // It's a standalone COLON (for a declaration or in a function call).
          this.add("COLON", char, start, start + 1);
          this.advancePosition(1);
          continue;
        }
      }

      // 13. Attribute Operators (e.g., =, ~=, |=, ^=, $=, *=)
      if (char === "=") {
        this.add("ATTR_EQUAL", char, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // Check for other attribute operators (e.g., ^=, $=, *=, ~=, |=)
      if (char === "~" || char === "|" || char === "^" || char === "$" || char === "*") {
        const nextChar = this.peekChar(1);
        if (nextChar === "=") {
          const operator = char + nextChar;
          this.add("ATTR_OPERATOR", operator, start, start + 2);
          this.advancePosition(2);
          continue;
        }

        // If it was '~' but NOT followed by '=', it is the general sibling COMBINATOR.
        if (char === "~") {
          this.add("COMBINATOR", char, start, start + 1);
          this.advancePosition(1);
          continue;
        }
      }

      // 14. Newline
      if (char === "\n" || char === "\r") {
        this.add("NEWLINE", char, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 15. Class selectors
      if (char === ".") {
        const dotStart = this.pos;
        const identifierStartChar = this.peekChar(1);

        // Check if the character following '.' is a valid identifier start (not a digit or EOF).
        // If it's a digit or nothing, it must be treated as a number (e.g., .5) or UNKNOWN/TEXT.
        if (identifierStartChar && !/[0-9.]/.test(identifierStartChar)) {

          // It's a class selector. Start consuming the identifier name.
          let classEnd = this.pos + 1; // Start looking *after* the '.'

          // Consume the identifier characters (letters, numbers, underscores, hyphens)
          while (classEnd < this.length && /[a-zA-Z0-9_\-]/.test(s[classEnd])) {
            classEnd++;
          }

          const classValue = s.slice(dotStart, classEnd);

          // Check to ensure we consumed more than just the '.' itself.
          if (classValue.length > 1) {
            this.add("CLASS_SELECTOR", classValue, dotStart, classEnd, "cp-token-selector");
            this.advancePosition(classEnd - dotStart); // Advance by the full token length
            continue;
          }
        }

        this.add("UNKNOWN", char, start, start + 1, "cp-token-unknown");
        this.advancePosition(1);
        continue;
      }

      // 16. Numbers & Units
      const substring = s.slice(this.pos);
      const numberMatch = substring.match(new RegExp(cssTokens.numberRegex));

      if (numberMatch) {
        const numberValue = numberMatch[0];
        const numberEnd = start + numberValue.length;

        // Tokenize the NUMBER part
        this.add("NUMBER", numberValue, start, numberEnd, "cp-token-number");
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
          this.add("UNIT", unitValue, unitStart, unitEnd, "cp-token-unit");
          this.advancePosition(unitValue.length);
        }

        // Number and optional unit processed, continue the main loop
        continue;
      }

      // 17. Pseudo-Classes/Elements
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
              this.add("PSEUDO_ELEMENT", tokenValue, colonStart, tokenEnd, "cp-token-pseudo-element");
              this.advancePosition(tokenEnd - identifierStart); // Advance past the identifier
              continue;
            }
          } else {
            // Check for Pseudo-Class
            if (cssTokens.pseudoClasses.has(identifierValue)) {
              this.add("PSEUDO_CLASS", tokenValue, colonStart, tokenEnd, "cp-token-pseudo-class");
              this.advancePosition(tokenEnd - identifierStart); // Advance past the identifier
              continue;
            }
          }

          // If the identifier was found but not in the known list, treat it as an UNKNOWN pseudo.
          this.lexerError(`Unknown pseudo selector: ${tokenValue}`, colonStart, tokenEnd);
          this.add("ERROR_TOKEN", tokenValue, colonStart, tokenEnd, "cp-token-error");
          this.advancePosition(tokenEnd - identifierStart); // Advance past the identifier
          continue;

        } else {
          // Error: Just ':' or '::' without a name (e.g., div: { } or div:: )
          const errorValue = s.slice(colonStart, this.pos);
          this.lexerError(`Incomplete pseudo selector: Identifier expected after '${errorValue}'`, colonStart, this.pos);
          this.add("ERROR_TOKEN", errorValue, colonStart, this.pos, "cp-token-error");
          continue; // Position is already advanced past the colon(s)
        }
      }

      // 18. Hex Color Codes and ID Selectors
      if (char === "#") {
        const hashStart = this.pos;
        const hashSubstring = s.slice(this.pos + 1);

        // 1. Try to match as a Hex Color Code
        const hexMatch = hashSubstring.match(cssTokens.hexColorCodeRegex);

        if (hexMatch) {
          const hexValue = "#" + hexMatch[0];
          const hexEnd = hashStart + hexValue.length;

          this.add("HEX_COLOR", hexValue, hashStart, hexEnd, "cp-token-color");
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
            this.add("ID_SELECTOR", idValue, hashStart, idEnd, "cp-token-selector");
            this.advancePosition(idEnd - hashStart); // Advance by the full token length
            continue;
          }
        }

        // 3. If it failed both checks (Hex/ID), treat the '#' as UNKNOWN/TEXT for now.
        // This must be done manually since the UNKNOWN rule only groups from the *next* char.
        this.add("UNKNOWN", char, start, start + 1, "cp-token-unknown");
        this.advancePosition(1);
        continue;
      }

      // 19. At-Rule (e.g., @import, @media, @charset)
      if (char === "@") {
        const atStart = this.pos;
        this.advancePosition(1); // Consume '@'

        let j = this.pos;

        // Consume the identifier characters (letters, numbers, underscores, hyphens)
        while (j < this.length && /[a-zA-Z0-9_\-]/.test(s[j])) {
          j++;
        }

        const value = s.slice(atStart, j);

        // Check if it's known at-rule
        if (cssTokens.atRules.has(value)) {
          this.add("AT_RULE", value, atStart, j, "cp-token-keyword");
          this.advancePosition(j - this.pos); // Advance past the identifier part
          continue;
        }

        // If it's just '@', treat as UNKNOWN/Error
        this.lexerError("Invalid At-Rule: Expected identifier after '@'", atStart, j);
        this.add("ERROR_TOKEN", char, start, start + 1, "cp-token-error");
        this.advancePosition(1);
        continue;
      }

      // 20. Custom properties (variables)
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
          this.add("CUSTOM_PROPERTY", value, propStart, j, "cp-token-variable");
          this.advancePosition(j - this.pos); // Advance past the identifier part
          continue;
        }

        this.lexerError("Invalid CSS custom property: Name expected after '--'", propStart, j);
        this.add("ERROR_TOKEN", value, propStart, j, "cp-token-error");
        this.advancePosition(j - this.pos);
        continue;
      }

      // 21. Functions, color keywords, and values
      if (/[a-zA-Z_\-]/.test(char)) { // Only proceed if it starts like a normal identifier
        let identifierEnd = this.pos + 1;

        // 1. Consume full potential identifier
        while (identifierEnd < this.length && /[a-zA-Z0-9_\-]/.test(s[identifierEnd])) {
          identifierEnd++;
        }

        const value = s.slice(start, identifierEnd);

        // 2. Check if it's a known function AND followed by '('
        if (cssTokens.functions.has(value) && s.startsWith(cssTokens.functionStart, identifierEnd)) {
          const tokenEnd = identifierEnd + 1;

          // Tokenize the function name
          this.add("FUNCTION", value, start, identifierEnd, "cp-token-function");

          // Tokenize the opening parenthesis (consume it in place)
          this.add("PAREN_OPEN", cssTokens.functionStart, identifierEnd, tokenEnd);

          // Advance position past the function name and the '('
          this.advancePosition(tokenEnd - start);
          continue;
        }

        // 3. Check if it's known color keyword
        if (cssTokens.colorKeywords.has(value)) {
          this.add("COLOR_KEYWORD", value, start, identifierEnd, "cp-token-color");
          this.advancePosition(identifierEnd - start);
          continue;
        }

        // 4. Check if it's a general CSS value keyword
        if (cssTokens.values.has(value)) {
          this.add("VALUE_KEYWORD", value, start, identifierEnd, "cp-token-value");
          this.advancePosition(identifierEnd - start);
          continue;
        }

        // 4. Check if it's a valid property
        if (cssTokens.properties.has(value) || cssTokens.logicalProperties.has(value)) {
          this.add("PROPERTY", value, start, identifierEnd, "cp-token-property");
          this.advancePosition(identifierEnd - start);
          continue;
        }

        // 5. Check if it's a known HTML Attribute
        if (cssTokens.attributeSelectors.has(value)) {
          this.add("ATTRIBUTE_NAME", value, start, identifierEnd, "cp-token-attribute");
          this.advancePosition(identifierEnd - start);
          continue;
        }

        // 6. Check if it's a known HTML Tag
        if (cssTokens.tagSelectors.has(value)) {
          this.add("TAG_NAME", value, start, identifierEnd, "cp-token-tag-selector");
          this.advancePosition(identifierEnd - start);
          continue;
        }
      }

      // 22. Identifiers (Handles tag selectors like 'h1', property names, etc.)
      if (/[a-zA-Z_\-]/.test(char) || /[\u0080-\uffff]/.test(char)) {
        let j = this.pos + 1;

        // Consume the rest of the valid identifier characters
        while (j < this.length && /[a-zA-Z0-9_\-]/.test(s[j])) {
          j++;
        }

        const value = s.slice(start, j);

        // Tokenize as a generic IDENTIFIER (this includes selectors like h1)
        this.add("IDENTIFIER", value, start, j, "cp-token-identifier");
        this.advancePosition(j - start);
        continue;
      }

      // 23. Ignore all other characters
      let j = this.pos + 1;

      // We check if the next character starts ANY known token (comment, brace, quote, whitespace).
      while (j < this.length) {
        const nextChar = s[j];

        // If the next character starts a known token type, stop here.
        // Known starts: /, {, }, ', ", space, tab, newline, +/-, digit, dot, or #.
        if (
          nextChar === "/" || nextChar === "'" || nextChar === '"' || nextChar === "#" ||
          nextChar === " " || nextChar === "\t" || nextChar === "\n" || nextChar === "\r" ||
          nextChar === "." || nextChar === ":" || nextChar === ";" || nextChar === "," ||
          nextChar === "@" || nextChar === '[' || nextChar === ']' || nextChar === '=' ||
          nextChar === '~' || nextChar === '|' || nextChar === '^' || nextChar === '$' ||
          nextChar === '*' ||
          nextChar === cssTokens.braceStart || nextChar === cssTokens.braceEnd ||
          nextChar === cssTokens.functionStart || nextChar === cssTokens.functionEnd ||
          /[+\-.]/.test(nextChar) || /[0-9.]/.test(nextChar) || /[a-zA-Z_\-]/.test(nextChar)
        ) {
            break;
        }
        j++;
      }

      const value = s.slice(start, j);

      // Explicit Error Handling: Check if 'value' contains characters that should be impossible in CSS.
      if (value.length === 1 && j === start + 1) {
        // If the single character is not part of a multi-char token (like comment, string),
        // AND it wasn't recognized by any rule, it's likely an error.
        this.lexerError(`Illegal character found: '${char}'`, start, j);
        this.add("ERROR_TOKEN", char, start, j, "cp-token-error");
        this.advancePosition(1);
        continue;
      }

      this.add("UNKNOWN", value, start, j, "cp-token-unknown");
      this.advancePosition(j - start);
      continue;
    }

    return this.tokens;
  }
}
