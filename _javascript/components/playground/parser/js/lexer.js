import { BaseLexer } from "../base-lexer";
import { jsTokens } from "./constants";

// Template literal parsing states
const TEMPLATE_STATE = {
  OUTSIDE: 0, // Not inside any template literal
  IN_TEMPLATE: 1, // Inside a template literal (parsing content)
  IN_EXPRESSION: 2, // Inside a ${...} expression (standard JS tokenization resumes)
};

export class JsLexer extends BaseLexer {
  // New state management property
  templateState = TEMPLATE_STATE.OUTSIDE;

  run() {
    const s = this.input;

    while (!this.eof()) {
      const char = this.peekChar(); // Peek at the current character
      const start = this.pos; // Capture start position

      // 1. Template literals
      if (this.templateState === TEMPLATE_STATE.IN_EXPRESSION) {
        // If inside an expression, check ONLY for the closing brace '}'
        if (char === jsTokens.braceEnd) {
          // This must be the closing brace for the template expression
          this.add("TEMPLATE_EXPR_CLOSE", jsTokens.braceEnd, start, start + 1, "cp-token-delimiter");
          this.advancePosition(1);
          this.templateState = TEMPLATE_STATE.IN_TEMPLATE; // Back to content mode
          continue;
        }
        // Fall through to standard tokenization for everything else (e.g., recursive blocks, keywords, etc.)
        // This is crucial for handling nested structures like `${ { a: 1 } }`
      } else if (this.templateState === TEMPLATE_STATE.IN_TEMPLATE) {
        // a. Check for template end backtick
        if (char === jsTokens.templateLiteral) {
          this.add("TEMPLATE_LITERAL_END", jsTokens.templateLiteral, start, start + 1, "cp-token-string");
          this.advancePosition(1);
          this.templateState = TEMPLATE_STATE.OUTSIDE; // Exited template
          continue;
        }

        // b. Check for interpolation start '${'
        if (s.startsWith(jsTokens.templateExprStart, this.pos)) {
          this.add("TEMPLATE_EXPR_OPEN", jsTokens.templateExprStart, start, start + 2, "cp-token-delimiter");
          this.advancePosition(2);
          this.templateState = TEMPLATE_STATE.IN_EXPRESSION; // Enter expression mode
          continue;
        }

        // c. Consume template content (including newlines and other characters)
        let j = this.pos + 1;
        while (j < this.length) {
          const nextChar = s[j];
          // Stop if the next character is the end backtick or start of interpolation
          if (nextChar === jsTokens.templateLiteral || (nextChar === '$' && s[j + 1] === '{')) {
            break;
          }
          j++;
        }

        // d. Add a TEMPLATE_CONTENT token for consumed text
        if (j > start) {
          this.add("TEMPLATE_CONTENT", s.slice(start, j), start, j, "cp-token-string");
          this.advancePosition(j - start);
          continue;
        }
      } else if (char === jsTokens.templateLiteral) {
        // TEMPLATE_STATE.OUTSIDE: Check for template start backtick
        this.add("TEMPLATE_LITERAL_START", jsTokens.templateLiteral, start, start + 1, "cp-token-string");
        this.advancePosition(1);
        this.templateState = TEMPLATE_STATE.IN_TEMPLATE; // Enter template content mode
        continue;
      }

      // 2. Multi-line Comment
      if (s.startsWith(jsTokens.commentStart, this.pos)) {
        const end = s.indexOf(jsTokens.commentEnd, this.pos + 2);
        let j = this.length;

        if (end === -1) {
          // Unclosed comment check.
          this.lexerError("Unclosed JavaScript comment: Expected '*/'", start, this.length);
        } else {
          // Closed comment
          j = end + 2;
        }

        this.add("COMMENT", s.slice(start, j), start, j, "cp-token-comment");
        this.advancePosition(j - start);
        continue;
      }

      // 3. Single-line Comment
      if (s.startsWith(jsTokens.singleLineComment, this.pos)) {
        let j = this.pos + 2;
        // Scan to the end of the line ('\n') or EOF
        while (j < this.length && s[j] !== "\n") j++;
        // Note: The parser handles checking if this single-line token spans multiple lines
        this.add("SINGLE_COMMENT", s.slice(start, j), start, j, "cp-token-comment");
        this.advancePosition(j - start);
        continue;
      }

      // 4. Block Open
      if (char === jsTokens.braceStart) {
        this.add("BLOCK_OPEN", jsTokens.braceStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 5. Block Close
      if (char === jsTokens.braceEnd) {
        this.add("BLOCK_CLOSE", jsTokens.braceEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 6. Parenthesis Open (()
      if (char === jsTokens.parenStart) {
        this.add("PAREN_OPEN", jsTokens.parenStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 7. Parenthesis Close ())
      if (char === jsTokens.parenEnd) {
        this.add("PAREN_CLOSE", jsTokens.parenEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 8. Bracket Open ([)
      if (char === jsTokens.bracketStart) {
        this.add("BRACKET_OPEN", jsTokens.bracketStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 9. Bracket Close (])
      if (char === jsTokens.bracketEnd) {
        this.add("BRACKET_CLOSE", jsTokens.bracketEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 10. String literals
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
          // Log error and create a LexerError object (using the refactored method)
          this.lexerError(`Unclosed string literal: Expected '${quoteType}'`, start, end);
          // Add the token anyway, but use a specific error type/class for visualization
          this.add("ERROR_STRING", s.slice(start, end), start, end, "cp-token-error");
        }
        continue;
      }

      // 11. Operators
      let matchedOperator = null;
      for (const op of jsTokens.operators) {
        if (s.startsWith(op, this.pos)) {
          matchedOperator = op;
          break; // Found the longest match
        }
      }

      if (matchedOperator) {
        const length = matchedOperator.length;
        this.add("OPERATOR", matchedOperator, start, start + length, "cp-token-delimiter");
        this.advancePosition(length);
        continue;
      }

      // 12. Whitespace (explicitly handle standard space and other non-newline whitespace)
      if (/\s/.test(char) && char !== "\n" && char !== "\r" && char !== "\t") {
        this.add("WHITESPACE", char, start, start + 1, "editor-token-space");
        this.advancePosition(1);
        continue;
      }

      // 13. Tab
      if (char === "\t") {
        this.add("TAB", char, start, start + 1, "editor-token-tab");
        this.advancePosition(1);
        continue;
      }

      // 14. Newline
      if (char === "\n" || char === "\r") {
        this.add("NEWLINE", char, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 15. Identifiers, Keywords, Built-ins, and Literals
      if (/[a-zA-Z_$]/.test(char)) {
        let j = this.pos + 1;

        // Scan until a character that cannot be part of an identifier
        while (j < this.length && /[a-zA-Z0-9_$]/.test(s[j])) {
          j++;
        }

        const value = s.slice(start, j);

        if (jsTokens.keywords.has(value)) {
          this.add("KEYWORD", value, start, j, "cp-token-keyword");
        } else if (jsTokens.builtInGlobals.has(value) || jsTokens.builtInVariables.has(value)) {
          this.add("BUILT_IN", value, start, j, "cp-token-built-in");
        } else if (jsTokens.domMethods.has(value)) {
          this.add("BUILT_IN", value, start, j, "cp-token-function");
        } else if (jsTokens.literals.has(value)) {
          this.add("LITERAL", value, start, j, "cp-token-keyword");
        } else {
          this.add("IDENTIFIER", value, start, j, "cp-token-identifier");
        }

        this.advancePosition(j - start);
        continue;
      }

      // 16. Ignore all other characters
      let j = this.pos + 1;

      // We check if the next character starts ANY known token (comment, brace, quote, whitespace).
      while (j < this.length) {
        const nextChar = s[j];

        // If the next character starts a known token type, stop here.
        // Known starts: /, {, }, (, ), [, ], ', ", space, tab, newline.
        // We can check if the character is one of the starting characters of an operator.
        const opStarts = new Set(Array.from(jsTokens.operators).map(op => op[0]));

        const isStopChar = (
          nextChar === "/" ||
          nextChar === jsTokens.braceStart ||
          (nextChar === jsTokens.braceEnd && this.templateState !== TEMPLATE_STATE.IN_TEMPLATE) ||
          nextChar === jsTokens.parenStart || nextChar === jsTokens.parenEnd ||
          nextChar === jsTokens.bracketStart || nextChar === jsTokens.bracketEnd ||
          nextChar === "'" || nextChar === '"' ||
          /\s/.test(nextChar) || /[a-zA-Z_$]/.test(nextChar) ||
          opStarts.has(nextChar) ||
          (nextChar === "`" && this.templateState === TEMPLATE_STATE.OUTSIDE) ||
          (nextChar === "$" && s[j + 1] === "{" && this.templateState === TEMPLATE_STATE.IN_TEMPLATE)
        );

        if (isStopChar) break;

        j++;
      }

      const value = s.slice(start, j);
      this.add("TEXT", value, start, j, "cp-token-unknown");
      this.advancePosition(j - start);
      continue;
    }

    // Lexer Error for unclosed template literal on EOF
    if (this.templateState === TEMPLATE_STATE.IN_TEMPLATE) {
      this.lexerError("Unclosed template literal: Expected '`'", this.pos, this.length);

      // Only add the ERROR_STRING if there was content
      if (this.pos < this.length) {
        // If we are IN_TEMPLATE and there is still unconsumed input, mark it as error content
        this.add("ERROR_STRING", s.slice(this.pos, this.length), this.pos, this.length, "cp-token-error");
      }
    } else if (this.templateState === TEMPLATE_STATE.IN_EXPRESSION) {
      // if we are IN_EXPRESSION, the input *should* be marked
      // as error because we are missing the '}'.
      this.lexerError("Unclosed template expression: Expected '}'", this.input.lastIndexOf("${") + 2 || 0, this.length);
      this.add("ERROR_STRING", s.slice(this.pos, this.length), this.pos, this.length, "cp-token-error");
    }

    return this.tokens;
  }
}
