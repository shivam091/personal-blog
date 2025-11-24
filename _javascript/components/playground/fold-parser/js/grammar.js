export const jsGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];

      while (!p.eof()) {
        const node = p.oneOf(["Block", "Comment", "SingleComment"]);

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

    SingleComment(p) {
      const t = p.matchType("SINGLE_COMMENT");
      // Single-line comments are only folded if they span multiple lines.
      // The LanguageEngine's _findFolds method handles the line check.
      return t ? { type: "Comment", start: t.start, end: t.end } : null;
    },

    Block(p) {
      const open = p.matchType("BLOCK_OPEN");
      if (!open) return null;

      const children = [];
      let close = null;
      let balance = 1;

      // Use simple counter-based block parsing to handle nested braces
      while (true) {
        const next = p.peek();
        if (!next) break;

        if (next.type === "BLOCK_OPEN") {
          balance++;
        } else if (next.type === "BLOCK_CLOSE") {
          balance--;
          if (balance === 0) {
            close = p.next();
            break;
          }
        }

        // Still allow nested folding (comments inside blocks)
        const child = p.oneOf(["Comment", "SingleComment"]);
        if (child) { children.push(child); continue; }

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
