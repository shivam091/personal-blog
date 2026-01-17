import { ParserError } from "./parser-error";

/*
 * BaseParser provides shared parsing utilities for token-based recursive-descent parsers.
 * It manages token traversal, grammar rule application, error reporting, and recovery.
 * Concrete parsers should extend this class and define grammar rules in `this.grammar`.
 */
export class BaseParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
    this.errors = [];
    this.grammar = {};
  }

  /*
   * Checks if the parser has reached the End-of-File (EOF) and returns true if all tokens have
   * been consumed.
   */
  eof() {
    return this.pos >= this.tokens.length;
  }

  /*
   * Returns the token at the current position plus an optional 'offset' without advancing the
   * position. Used for lookahead to decide which rule to apply next.
   */
  peek(offset = 0) {
    return this.tokens[this.pos + offset];
  }

  /*
   * Returns the token at the current position and advances the position by one by consuming a token.
   */
  next() {
    return this.tokens[this.pos++];
  }

  /*
   * Records a parsing error.
   */
  error(message, token) {
    const errorToken = token || this.peek();

    // Check if errorToken is valid before proceeding
    if (errorToken) {
      // 1. Create and store the error object
      this.errors.push(new ParserError(message, errorToken));

      // 2. Add the error class to the token object
      const errorClass = "token-error";

      if (errorToken.class) {
        // Append the error class if other classes exist
        if (!errorToken.highlightClass.includes(errorClass)) {
          errorToken.highlightClass = `${errorToken.highlightClass} ${errorClass}`;
        }
      } else {
        // Set the error class if no other classes exist
        errorToken.highlightClass = errorClass;
      }
    }

    console.warn(`[Parser Error] ${message} at line ${errorToken.line}, col. ${errorToken.col}`, errorToken);
  }

  /*
   * Matches and consumes a token if it has the specified 'type' (and optionally 'value').
   * If matched, it calls 'next()' and returns the token; otherwise, it returns null.
   */
  matchType(type, value = null) {
    const token = this.peek();

    if (token && token.type === type && (value === null || token.value === value)) {
      this.next();
      return token;
    }
    return null;
  }

  /*
   * Universal matching method that attempts to apply a complex grammar rule
   * or match a simple atomic token type.
   */
  match(ruleNameOrTokenType) {
    const startPos = this.pos;
    const ruleFn = this.grammar[ruleNameOrTokenType];

    // Case 1: Complex Grammar Rule (is a function in the grammar)
    if (typeof ruleFn === "function") {
      const result = ruleFn(this);
      if (!result && startPos !== this.pos) {
        // Rule failed after consuming tokens, backtrack.
        this.pos = startPos;
      }
      return result;
    }

    // Case 2: Simple Atomic Token Type (is a string, e.g., "COMMA", "SPACE")
    else if (typeof ruleNameOrTokenType === "string") {
      return this.matchType(ruleNameOrTokenType);
    }

    // Case 3: Error
    console.error(`Parser Error: Invalid rule or token type: "${ruleNameOrTokenType}"`);
    return null;
  }

  /*
   * A wrapper for match function that explicitly applies a complex rule from
   * the grammar. Used to maintain clear intent when calling non-terminal grammar rules.
   */
  apply(ruleName) {
    // Apply is now a wrapper for match, ensuring the input is a rule name.
    return this.match(ruleName);
  }

  /*
   * Attempts to apply/match the rules or token types in the given array, in order.
   * It returns the result of the first successful match and stops checking the others.
   */
  oneOf(ruleNamesOrTokenTypes) {
    for (const name of ruleNamesOrTokenTypes) {
      const result = this.match(name);
      if (result) return result;
    }
    return null;
  }

  /*
   * Requires the next token to match the given type/value. If successful, consumes and
   * returns the token, otherwise, logs an error and returns null.
   */
  require(type, message, value = null) {
    const token = this.matchType(type, value);
    if (token) return token;

    // If no match, generate a specific error
    const errorMsg = message || `Expected token type "${type}"${value ? ` with value "${value}"` : ''}, but found "${this.peek().type}"`;
    this.error(errorMsg);

    return null; // The caller must handle the failure
  }

  /*
   * Skips tokens until one of the specified types is encountered.
   * Used for error recovery (synchronization).
   */
  synchronize(syncTypes) {
    while (!this.eof()) {
      const token = this.peek();
      if (syncTypes.includes(token.type)) {
        // Found a synchronization point
        return;
      }
      this.next(); // Consume the token
    }
  }
}
