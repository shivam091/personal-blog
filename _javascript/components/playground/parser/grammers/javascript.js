export const javascriptGrammar = {
  startRule: "Expression",
  rules: {
    Expression(p) {
      return p.Sequence(["Term", "AddOp", "Term"]);
    },
    Term(p) {
      return p.OneOf(["number", "identifier"]);
    },
    AddOp(p) {
      return p.Token("symbol", ["+", "-"]);
    }
  }
};
