export class GenericParser {
  constructor(grammar, options = {}) {
    this.grammar = grammar;
    this.options = options;
  }

  parse(input) {
    this.input = input;
    this.tokens = this.options.tokenizer(input);
    this.pos = 0;
    return this.apply(this.grammar.startRule);
  }

  apply(ruleName) {
    const fn = this.grammar.rules[ruleName];
    if (fn) return fn(this);
    return this.Token(ruleName);
  }

  Token(type, values) {
    const t = this.tokens[this.pos];
    if (t && t.type === type && (!values || values.includes(t.value))) {
      this.pos++;
      return { type: t.type, value: t.value };
    }
    return null;
  }

  Sequence(rules) {
    const nodes = [];
    const start = this.pos;
    for (const r of rules) {
      const n = this.apply(r);
      if (!n) {
        this.pos = start;
        return null;
      }
      nodes.push(n);
    }
    return { type: "Sequence", children: nodes };
  }

  OneOf(rules) {
    for (const r of rules) {
      const save = this.pos;
      const n = this.apply(r);
      if (n) return n;
      this.pos = save;
    }
    return null;
  }
}
