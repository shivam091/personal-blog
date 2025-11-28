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

        // Explicitly check for unmatched closing brace
        const next = p.peek();
        if (next) {
          if (next.type === "BLOCK_CLOSE") {
            p.error(`Unexpected closing brace '}' outside a block.`, next);
            p.next(); // Consume the error token and continue
            continue;
          }
        }

        // Explicitly consume known insignificant tokens
        if (p.oneOf(["WHITESPACE", "TAB"])) {
          continue;
        }

        // Consume all other tokens (selectors, properties, newlines, etc.)
        p.next();
      }

      // Add start/end to Document node for fold analysis
      return { type: "Document", children, start: 0, end: p.tokens.at(-1)?.end || 0 };
    },

    // Rule to match and consume a comment.
    Comment(p) {
      const t = p.matchType("COMMENT");

      return t ? { type: "Comment", start: t.start, end: t.end } : null;
    },

    // A Block handles rule sets, media queries, etc.
    Block(p) {
      const blockOpen = p.matchType("BLOCK_OPEN");
      if (!blockOpen) return null;

      const children = [];
      let blockClose = null;

      // Look for nested blocks or comments until the closing brace
      while (true) {
        const next = p.peek();
        if (!next) break;

        if (next.type === "BLOCK_CLOSE") {
          // Consume the closing brace and exit the loop.
          blockClose = p.next();
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

      // Error Handling: If the loop exited because of EOF, the block is unclosed.
      if (!blockClose) {
        p.error(`Unclosed CSS Block: Expected '}'`, blockOpen);
        // Continue, but define the block's end at the last consumed token.
        return {
          type: "Block",
          children,
          start: blockOpen.start,
          end: p.tokens.at(-1)?.end || blockOpen.end
        };
      }

      return {
        type: "Block",
        children,
        start: blockOpen.start,
        end: blockClose.end
      };
    },

    },

    // Rule to match and consume a single WHITESPACE token.
    WHITESPACE: (p) => p.matchType("WHITESPACE"),

    // Rule to match and consume a single TAB token.
    TAB: (p) => p.matchType("TAB"),
  }
};
