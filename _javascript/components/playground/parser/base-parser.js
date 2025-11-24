export class BaseParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
    this.errors = [];
    this.grammar = {};
  }

  eof() {
    return this.pos >= this.tokens.length;
  }

  peek(offset = 0) {
    return this.tokens[this.pos + offset];
  }

  next() {
    return this.tokens[this.pos++];
  }

  error(message, token) {
    const errorToken = token || this.peek();
    this.errors.push({
      message: message,
      token: errorToken,
    });
    console.warn(`[Parser Error] ${message} at pos ${this.pos}`, errorToken);
  }

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
    if (typeof ruleFn === 'function') {
      const result = ruleFn(this);
      if (!result && startPos !== this.pos) {
        // Rule failed after consuming tokens, backtrack.
        this.pos = startPos;
      }
      return result;
    }

    // Case 2: Simple Atomic Token Type (is a string, e.g., "COMMA", "SPACE")
    else if (typeof ruleNameOrTokenType === 'string') {
      return this.matchType(ruleNameOrTokenType);
    }

    // Case 3: Error
    console.error(`Parser Error: Invalid rule or token type: "${ruleNameOrTokenType}"`);
    return null;
  }

  apply(ruleName) {
    // Apply is now a wrapper for match, ensuring the input is a rule name.
    return this.match(ruleName);
  }

  oneOf(ruleNamesOrTokenTypes) {
    for (const name of ruleNamesOrTokenTypes) {
      const result = this.match(name);
      if (result) return result;
    }
    return null;
  }
}
