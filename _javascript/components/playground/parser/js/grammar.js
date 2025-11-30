import { INSIGNIFICANT_TOKENS } from "../constants";

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

        // Consume insignificant tokens
        if (p.oneOf(...INSIGNIFICANT_TOKENS)) continue;

        // Consume all other tokens (Keywords, Identifiers, Operators, etc.)
        p.next();
      }

      // Final Document node
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
      const blockOpen = p.matchType("BLOCK_OPEN");
      if (!blockOpen) return null;

      const children = [];
      let blockClose = null;

      while (true) {
        const next = p.peek();
        if (!next) break;

        if (next.type === "BLOCK_CLOSE") {
          blockClose = p.next(); // Consume the closing token
          break;
        }

        // Recursively match ALL structural types
        const child = p.oneOf(["Block", "Parentheses", "Brackets", "Comment", "SingleComment"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Consume all other content tokens and insignificant tokens
        p.next();
      }

      // Return structure whether closed or unclosed
      return {
        type: "Block",
        children,
        start: blockOpen.start,
        end: (blockClose || p.tokens.at(-1))?.end || blockOpen.end
      };
    },

    // Rule for matching & consuming parenthesis regions: ( ... )
    Parentheses(p) {
      const parenOpen = p.matchType("PAREN_OPEN");
      if (!parenOpen) return null;

      const children = [];
      let parenClose = null;

      while (true) {
        const next = p.peek();
        if (!next) break;

        if (next.type === "PAREN_CLOSE") {
          parenClose = p.next(); // Consume the closing token
          break;
        }

        // Recursively match ALL structural types
        const child = p.oneOf(["Block", "Parentheses", "Brackets", "Comment", "SingleComment"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Consume all other content tokens and insignificant tokens
        p.next();
      }

      // Return structure whether closed or unclosed
      return {
        type: "Parentheses",
        children,
        start: parenOpen.start,
        end: (parenClose || p.tokens.at(-1))?.end || parenOpen.end
      };
    },

    // Rule for matching & consuming brackets regions: [ ... ]
    Brackets(p) {
      const bracketOpen = p.matchType("BRACKET_OPEN");
      if (!bracketOpen) return null;

      const children = [];
      let bracketClose = null;

      while (true) {
        const next = p.peek();
        if (!next) break;

        if (next.type === "BRACKET_CLOSE") {
          bracketClose = p.next(); // Consume the closing token
          break;
        }

        // Recursively match ALL structural types
        const child = p.oneOf(["Block", "Parentheses", "Brackets", "Comment", "SingleComment"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Consume all other content tokens and insignificant tokens
        p.next();
      }

      // Return structure whether closed or unclosed
      return {
        type: "Brackets",
        children,
        start: bracketOpen.start,
        end: (bracketClose || p.tokens.at(-1))?.end || bracketOpen.end
      };
    },

    // Rule to match and consume a single WHITESPACE token.
    WHITESPACE: (p) => p.matchType("WHITESPACE"),

    // Rule to match and consume a single TAB token.
    TAB: (p) => p.matchType("TAB"),

    // Rule to match and consume a new line.
    NEWLINE: (p) => p.matchType("NEWLINE"),
  }
};
