export const htmlGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];

      while (!p.eof()) {
        const node = p.oneOf(["Element", "Comment"]);

        if (!node) {
          // Consume any non-structural token to prevent infinite loop
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

    Element(p) {
      const open = p.matchType("TAG_OPEN");
      if (!open) return null;

      const children = [];
      let close = null;

      // Continue parsing children (nested Elements, Comments) until we hit a closing tag
      while (true) {
        const next = p.peek();
        if (!next) break;

        // Stop if we find a closing tag token
        if (next.type === "TAG_CLOSE") {
          close = p.next();
          break;
        }

        // Recursively parse nested elements or comments
        const child = p.oneOf(["Element", "Comment"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Ignore non-structural tokens
        p.next();
      }

      // Requires a closing tag token to define the fold range
      if (!close) return null;

      return {
        type: "Element",
        name: open.value,
        children,
        start: open.start,
        end: close.end // Use the end of the closing tag token
      };
    }
  }
};
