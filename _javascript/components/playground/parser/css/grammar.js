export const cssGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];

      while (!p.eof()) {
        // Try to match structural nodes
        const node = p.oneOf(["Block", "Comment"]);
        if (node) {
          children.push(node);
          continue;
        }

        // Explicitly consume known insignificant tokens
        if (p.oneOf(["WHITESPACE", "TAB"])) {
          continue;
        }

        // Consume all other tokens (selectors, properties, newlines, etc.)
        p.next();
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

        // Explicitly consume known insignificant tokens
        if (p.oneOf(["WHITESPACE", "TAB"])) {
          continue;
        }

        // Consume all other text/unknown tokens (like newlines or actual text content)
        p.next();
      }

      if (!close) return null;

      return {
        type: "Block",
        children,
        start: open.start,
        end: close.end
      };
    },

    // Rule to match and consume a single WHITESPACE token.
    WHITESPACE(p) {
      return p.matchType("WHITESPACE");
    },

    // Rule to match and consume a single TAB token.
    TAB(p) {
      return p.matchType("TAB");
    },
  }
};
