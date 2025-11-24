export const htmlGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];

      while (!p.eof()) {
        // Try to match structural nodes
        const node = p.oneOf(["Element", "Comment"]);
        if (node) {
          children.push(node);
          continue;
        }

        // Explicitly consume known insignificant tokens
        if (p.oneOf(["WHITESPACE", "TAB"])) {
          continue;
        }

        // Consume all other text/unknown tokens
        p.next();
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

        // Explicitly consume SPACE and TAB
        if (p.oneOf(["WHITESPACE", "TAB"])) {
          continue;
        }

        // Consume all other text/unknown tokens (like newlines or actual text content)
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
