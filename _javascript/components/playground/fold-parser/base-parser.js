export class BaseParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
    this.errors = [];
    this.grammar = {}; // Must be defined by subclass
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

  apply(ruleName) {
    const startPos = this.pos;
    const result = this.grammar[ruleName](this);

    // If the rule failed, reset the position and return null
    if (!result && startPos !== this.pos) {
      this.pos = startPos;
      return null;
    }

    return result;
  }

  oneOf(ruleNames) {
    for (const ruleName of ruleNames) {
      const result = this.apply(ruleName);
      if (result) return result;
    }

    return null;
  }
}
