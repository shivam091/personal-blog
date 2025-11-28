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
        if (p.oneOf(...INSIGNIFICANT_TOKENS)) continue;

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

        // Stop condition
        if (next.type === "PAREN_CLOSE" || next.type === "BRACKET_CLOSE") {
          let offset = 1;
          let lookahead = p.peek(offset);

          // 1. skip whitespace in lookahead
          while (lookahead && INSIGNIFICANT_TOKENS.includes(lookahead.type)) {
            offset++;
            lookahead = p.peek(offset);
          }

          // 2. If the valid closer is next, treat 'next' as a typo/extra char
          if (lookahead && lookahead.type === "BLOCK_CLOSE") {
            p.error(`Unexpected '${next.value}' inside Block.`, next);
            p.next();
            continue;
          }

          // 3. Otherwise, it's a structural break (belongs to parent)
          break;
        }

        // Recursively match ALL structural types
        const child = p.oneOf(["Block", "Parentheses", "Brackets", "Comment", "SingleComment"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Explicitly consume known insignificant tokens
        if (p.oneOf(...INSIGNIFICANT_TOKENS)) continue;

        // Consume all other content tokens (Keywords, Identifiers, Operators, etc.)
        p.next();
      }

      // Error handling
      if (!blockClose) {
        p.error(`Unclosed JavaScript Block: Expected '}'`, blockOpen);

        // Explicitly return the unclosed structure here
        return {
          type: "Block",
          children,
          start: blockOpen.start,
          end: p.tokens.at(-1)?.end || blockOpen.end
        };
      }

      // Open and close braces found
      return {
        type: "Block",
        children,
        start: blockOpen.start,
        end: blockClose.end
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

        // Stop condition
        if (next.type === "BLOCK_CLOSE" || next.type === "BRACKET_CLOSE") {
          let offset = 1;
          let lookahead = p.peek(offset);

          // 1. Look ahead
          while (lookahead && INSIGNIFICANT_TOKENS.includes(lookahead.type)) {
            offset++;
            lookahead = p.peek(offset);
          }

          // 2. If the valid closer is next, treat 'next' as a typo
          if (lookahead && lookahead.type === "PAREN_CLOSE") {
            p.error(`Unexpected '${next.value}' inside Parentheses.`, next);
            p.next();
            continue;
          }

          // 3. Otherwise, break
          break;
        }

        // Recursively match ALL structural types
        const child = p.oneOf(["Block", "Parentheses", "Brackets", "Comment", "SingleComment"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Explicitly consume known insignificant tokens
        if (p.oneOf(...INSIGNIFICANT_TOKENS)) continue;

        // Consume all other content tokens (Keywords, Identifiers, Operators, etc.)
        p.next();
      }

      // Error handling
      if (!parenClose) {
        p.error(`Unclosed Parentheses: Expected ')'`, parenOpen);

        // Explicitly return the unclosed structure here
        return {
          type: "Parentheses",
          children,
          start: parenOpen.start,
          end: p.tokens.at(-1)?.end || parenOpen.end
        };
      }

      // Open and close parenthesis found
      return {
        type: "Parentheses",
        children,
        start: parenOpen.start,
        end: parenClose.end
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

        // Stop condition
        if (next.type === "BLOCK_CLOSE" || next.type === "PAREN_CLOSE") {
          // 1. Look ahead
          let offset = 1;
          let lookahead = p.peek(offset);
          while (lookahead && INSIGNIFICANT_TOKENS.includes(lookahead.type)) {
            offset++;
            lookahead = p.peek(offset);
          }

          // 2. If the valid closer is next, treat 'next' as a typo
          if (lookahead && lookahead.type === "BRACKET_CLOSE") {
            p.error(`Unexpected '${next.value}' inside Brackets.`, next);
            p.next();
            continue;
          }

          break;
        }

        // Recursively match ALL structural types
        const child = p.oneOf(["Block", "Parentheses", "Brackets", "Comment", "SingleComment"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Explicitly consume known insignificant tokens
        if (p.oneOf(...INSIGNIFICANT_TOKENS)) continue;

        // Consume all other content tokens (Keywords, Identifiers, Operators, etc.)
        p.next();
      }

      if (!bracketClose) {
        p.error(`Unclosed Brackets: Expected ']'`, bracketOpen);

        // Explicitly return the unclosed structure here
        return {
          type: "Brackets",
          children,
          start: bracketOpen.start,
          end: p.tokens.at(-1)?.end || bracketOpen.end
        };
      }

      // Open and close brackets found
      return {
        type: "Brackets",
        children,
        start: bracketOpen.start,
        end: bracketClose.end
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
