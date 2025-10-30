export const htmlGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const nodes = [];
      while (p.pos < p.tokens.length) {
        const node =
          p.OneOf(["Element", "Text"]) || p.Token("error");
        if (!node) break;
        nodes.push(node);
      }
      return { type: "Document", children: nodes };
    },

    Element(p) {
      const open = p.Token("symbol", ["<"]);
      const name = p.Token("identifier");
      if (!open || !name) return null;
      const attrs = [];
      while (true) {
        const attr = p.apply?.("Attribute");
        if (!attr) break;
        attrs.push(attr);
      }
      p.Token("symbol", [">"]);
      const children = [];
      while (!p.Token("symbol", ["</"])) {
        const child = p.OneOf(["Element", "Text"]);
        if (!child) break;
        children.push(child);
      }
      p.Token("identifier"); // closing name
      p.Token("symbol", [">"]);
      return { type: "Element", name: name.value, attrs, children };
    },

    Attribute(p) {
      const key = p.Token("identifier");
      if (!key) return null;
      const eq = p.Token("symbol", ["="]);
      const val = p.Token("identifier") || p.Token("string");
      if (!eq || !val) return null;
      return { type: "Attribute", key: key.value, value: val.value };
    },

    Text(p) {
      const t = p.Token("identifier");
      return t ? { type: "Text", value: t.value } : null;
    }
  }
};
