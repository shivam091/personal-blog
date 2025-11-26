export const jsGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];

      while (!p.eof()) {
        // Try to match structural nodes
        const node = p.oneOf(["Block", "Parentheses", "Brackets", "Comment", "SingleComment"]);
        if (node) {
          children.push(node);
          continue;
        }

        // Explicitly check for unmatched closing delimiters
        const next = p.peek();
        if (next) {
          if (next.type === "BLOCK_CLOSE" || next.type === "PAREN_CLOSE" || next.type === "BRACKET_CLOSE") {
            p.error(`Unexpected closing delimiter: ${next.value}`, next);
            p.next(); // Consume the error token and continue
            continue;
          }
        }

        // Explicitly consume known insignificant tokens
        if (p.oneOf(["WHITESPACE", "TAB"])) {
          continue;
        }

        // Consume all other tokens (Keywords, Identifiers, Operators, etc.)
        p.next();
      }

      // Add start/end to Document node for fold analysis
      return { type: "Document", children, start: 0, end: p.tokens.at(-1)?.end || 0 };
    },

    // Rule to match and consume a block comment.
    Comment(p) {
      const t = p.matchType("COMMENT");

      return t ? { type: "Comment", start: t.start, end: t.end } : null;
    },

    // Rule to match and consume a single line comment.
    SingleComment(p) {
      const t = p.matchType("SINGLE_COMMENT");

      return t ? { type: "Comment", start: t.start, end: t.end } : null;
    },

    // Rule for matching & consuming curly brace regions: { ... }
    Block(p) {
      const open = p.matchType("BLOCK_OPEN");
      if (!open) return null;

      const children = [];
      let close = null;

      while (true) {
        const next = p.peek();
        if (!next) break;

        if (next.type === "BLOCK_CLOSE") {
          close = p.next(); // Consume the closing token
          break;
        }

        // Recursively match ALL structural types
        const child = p.oneOf(["Block", "Parentheses", "Brackets", "Comment", "SingleComment"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Explicitly consume known insignificant tokens
        if (p.oneOf(["WHITESPACE", "TAB"])) {
          continue;
        }

        // Consume all other content tokens (Keywords, Identifiers, Operators, etc.)
        p.next();
      }

      // Error handling
      if (!close) {
        p.error(`Unclosed JavaScript Block: Expected '}'`, open);

        // Explicitly return the unclosed structure here
        return {
          type: "Block",
          children,
          start: open.start,
          end: p.tokens.at(-1)?.end || open.end
        };
      }

      // Open and close braces found
      return {
        type: "Block",
        children,
        start: open.start,
        end: close.end
      };
    },

    // Rule for matching & consuming parenthesis regions: ( ... )
    Parentheses(p) {
      const open = p.matchType("PAREN_OPEN");
      if (!open) return null;

      const children = [];
      let close = null;

      while (true) {
        const next = p.peek();
        if (!next) break;

        if (next.type === "PAREN_CLOSE") {
          close = p.next(); // Consume the closing token
          break;
        }

        // Recursively match ALL structural types
        const child = p.oneOf(["Block", "Parentheses", "Brackets", "Comment", "SingleComment"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Explicitly consume known insignificant tokens
        if (p.oneOf(["WHITESPACE", "TAB"])) {
          continue;
        }

        // Consume all other content tokens (Keywords, Identifiers, Operators, etc.)
        p.next();
      }

      // Error handling
      if (!close) {
        p.error(`Unclosed Parentheses: Expected ')'`, open);

        // Explicitly return the unclosed structure here
        return {
          type: "Parentheses",
          children,
          start: open.start,
          end: p.tokens.at(-1)?.end || open.end
        };
      }

      // Open and close parenthesis found
      return {
        type: "Parentheses",
        children,
        start: open.start,
        end: close.end
      };
    },

    // Rule for matching & consuming brackets regions: [ ... ]
    Brackets(p) {
      const open = p.matchType("BRACKET_OPEN");
      if (!open) return null;

      const children = [];
      let close = null;

      while (true) {
        const next = p.peek();
        if (!next) break;

        if (next.type === "BRACKET_CLOSE") {
          close = p.next(); // Consume the closing token
          break;
        }

        // Recursively match ALL structural types
        const child = p.oneOf(["Block", "Parentheses", "Brackets", "Comment", "SingleComment"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Explicitly consume known insignificant tokens
        if (p.oneOf(["WHITESPACE", "TAB"])) {
          continue;
        }

        // Consume all other content tokens (Keywords, Identifiers, Operators, etc.)
        p.next();
      }

      if (!close) {
        p.error(`Unclosed Brackets: Expected ']'`, open);

        // Explicitly return the unclosed structure here
        return {
          type: "Brackets",
          children,
          start: open.start,
          end: p.tokens.at(-1)?.end || open.end
        };
      }

      // Open and close brackets found
      return {
        type: "Brackets",
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
