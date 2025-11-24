export const jsGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];

      while (!p.eof()) {
        // Try to match structural nodes
        const node = p.oneOf(["Block", "Comment", "SingleComment"]);
        if (node) {
          children.push(node);
          continue;
        }

        // Explicitly consume known insignificant tokens
        if (p.oneOf(["WHITESPACE", "TAB"])) {
          continue;
        }

        // Consume all other tokens (like identifiers, operators, newlines)
        p.next();
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
