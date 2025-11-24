export const cssGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];

      while (!p.eof()) {
        const node = p.oneOf(["Block", "Comment"]);

        if (!node) {
          p.next();
          continue;
        }

        children.push(node);
      }

      return { type: "Document", children };
    },

    Comment(p) {
      const t = p.matchType("COMMENT");

      return t ? { type: "Comment", start: t.start, end: t.end } : null;
    },

    // A Block handles rule sets, media queries, etc.
    Block(p) {
      const open = p.matchType("BLOCK_OPEN");
      if (!open) return null;

      const children = [];
      let close = null;

      // Look for nested blocks or comments until the closing brace
      while (true) {
        const next = p.peek();
        if (!next) break;

        if (next.type === "BLOCK_CLOSE") {
          close = p.next();
          break;
        }

        const child = p.oneOf(["Block", "Comment"]);
        if (child) {
          children.push(child);
          continue;
        }

        p.next();
      }

      if (!close) return null;

      return {
        type: "Block",
        children,
        start: open.start,
        end: close.end
      };
    }
  }
};
