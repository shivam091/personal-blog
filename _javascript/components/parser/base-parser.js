export class BaseParser {
  constructor(tokens = []) {
    this.tokens = tokens;
    this._pos = 0;
    this.errors = [];
    this.grammar = null; // optional reference to helpers or rules
  }

  setTokens(tokens) {
    this.tokens = tokens;
    this._pos = 0;
    this.errors = [];
  }

  get pos() {
    return this._pos;
  }

  set pos(v) {
    this._pos = v;
  }

  peek(offset = 0) {
    return this.tokens[this._pos + offset] || null;
  }

  next() {
    return this.tokens[this._pos++] || null;
  }

  eof() {
    return this._pos >= this.tokens.length;
  }

  matchType(type, allowedValues) {
    const t = this.peek();

    if (!t || t.type !== type) return null;

    if (allowedValues) {
      if (Array.isArray(allowedValues)) {
        if (!allowedValues.includes(t.value)) return null;
      } else if (typeof allowedValues === 'string') {
        if (t.value !== allowedValues) return null;
      }
    }
    this._pos++;
    return t;
  }

  matchSymbol(sym) {
    const t = this.peek();
    if (!t) return null;
    if (t.type === 'SYMBOL' && t.value === sym) { this._pos++; return t; }
    if (t.type === 'PUNC' && t.value === sym) { this._pos++; return t; }
    return null;
  }

  oneOf(ruleNames) {
    const save = this._pos;
    for (const name of ruleNames) {
      const fn = this.grammar?.[name];
      if (!fn) continue;
      const out = fn(this);
      if (out) return out;
      this._pos = save;
    }
    return null;
  }

  apply(ruleName) {
    const fn = this.grammar?.[ruleName];
    if (!fn) throw new Error('Missing grammar rule ' + ruleName);
    return fn(this);
  }

  error(msg, token = this.peek()) {
    const pos = token ? { start: token.start, end: token.end } : { start: this._pos, end: this._pos };
    this.errors.push({ message: msg, pos });
  }

  run() {
    throw new Error("BaseParser.run must be implemented");
  }
}