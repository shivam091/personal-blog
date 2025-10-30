export const cssGrammar = {
  startRule: "Stylesheet",
  rules: {
    Stylesheet(p) {
      const rules = [];
      while (p.pos < p.tokens.length) {
        const r = p.apply?.("Rule");
        if (!r) break;
        rules.push(r);
      }
      return { type: "Stylesheet", children: rules };
    },

    Rule(p) {
      const selector = p.Token("identifier");
      if (!selector) return null;
      p.Token("symbol", ["{"]);
      const decls = [];
      while (!p.Token("symbol", ["}"])) {
        const d = p.apply?.("Declaration");
        if (!d) break;
        decls.push(d);
      }
      return { type: "Rule", selector: selector.value, decls };
    },

    Declaration(p) {
      const prop = p.Token("identifier");
      if (!prop) return null;
      p.Token("symbol", [":"]);
      const val = p.Token("identifier") || p.Token("number");
      p.Token("symbol", [";"]);
      return { type: "Declaration", property: prop.value, value: val?.value };
    }
  }
};