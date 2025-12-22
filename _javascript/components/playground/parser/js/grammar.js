import { INSIGNIFICANT_TOKENS } from "../constants";
import { jsTokens } from "./tokens";

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
        if (next && ["BLOCK_CLOSE", "PAREN_CLOSE", "BRACKET_CLOSE"].includes(next.type)) {
          p.error(`Unexpected closing delimiter: ${next.value}`, next);
          p.next(); // Consume the error token and continue
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
      const commentOpen = p.matchType("COMMENT_OPEN");
      if (!commentOpen) return null;

      let commentClose = null;
      while (!p.eof()) {
        if (p.peek().type === "COMMENT_CLOSE") {
          commentClose = p.next();
          break;
        }
        p.next();
      }

      if (!commentClose) {
        p.error(`Unclosed JavaScript comment: Expected '${jsTokens.commentEnd}'`, commentOpen);
      }

      return {
        type: "Comment",
        start: commentOpen.start,
        end: commentClose ? commentClose.end : commentOpen.end
      };
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

        // Premature structural break check
        if (next.type === "PAREN_CLOSE" || next.type === "BRACKET_CLOSE") {
          let offset = 1;
          let lookahead = p.peek(offset);

          // 1. Skip insignificant tokens in lookahead
          while (lookahead && INSIGNIFICANT_TOKENS.includes(lookahead.type)) {
            offset++;
            lookahead = p.peek(offset);
          }

          // 2. If the *valid* closer for the current rule is found soon after,
          // treat 'next' as a typo or extra char.
          if (lookahead && lookahead.type === "BLOCK_CLOSE") {
            p.error(`Unexpected '${next.value}' inside block.`, next);
            p.next(); // Consume the typo/extra char
            continue;
          }

          // 3. Otherwise, assume the unexpected delimiter belongs to a parent
          // structure and break gracefully (error handled by parent or Document).
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

      // Raise error if block is not closed
      if (!blockClose) {
        p.error(`Unclosed JavaScript Block: Expected '${jsTokens.braceEnd}'`, blockOpen);
      }

      // Return structure whether closed or unclosed
      return {
        type: "Block",
        children,
        start: blockOpen.start,
        end: blockClose ? blockClose.end : blockOpen.end
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

        // Premature structural break check
        if (next.type === "BLOCK_CLOSE" || next.type === "BRACKET_CLOSE") {
          let offset = 1;
          let lookahead = p.peek(offset);

          // 1. Skip insignificant tokens in lookahead
          while (lookahead && INSIGNIFICANT_TOKENS.includes(lookahead.type)) {
            offset++;
            lookahead = p.peek(offset);
          }

          // 2. If the *valid* closer for the current rule is found soon after,
          // treat 'next' as a typo or extra char.
          if (lookahead && lookahead.type === "PAREN_CLOSE") {
            p.error(`Unexpected '${next.value}' inside parenthesis.`, next);
            p.next(); // Consume the typo/extra char
            continue;
          }

          // 3. Otherwise, assume the unexpected delimiter belongs to a parent
          // structure and break gracefully (error handled by parent or Document).
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

      // Raise error if parenthesis is not closed
      if (!parenClose) {
        p.error(`Unclosed Parentheses: Expected '${jsTokens.parenEnd}'`, parenOpen);
      }

      // Return structure whether closed or unclosed
      return {
        type: "Parentheses",
        children,
        start: parenOpen.start,
        end: parenClose ? parenClose.end : parenOpen.end
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

        // Premature structural break check
        if (next.type === "BLOCK_CLOSE" || next.type === "PAREN_CLOSE") {
          let offset = 1;
          let lookahead = p.peek(offset);

          // 1. Skip insignificant tokens in lookahead
          while (lookahead && INSIGNIFICANT_TOKENS.includes(lookahead.type)) {
            offset++;
            lookahead = p.peek(offset);
          }

          // 2. If the *valid* closer for the current rule is found soon after,
          // treat 'next' as a typo or extra char.
          if (lookahead && lookahead.type === "BRACKET_CLOSE") {
            p.error(`Unexpected '${next.value}' inside bracket.`, next);
            p.next(); // Consume the typo/extra char
            continue;
          }

          // 3. Otherwise, assume the unexpected delimiter belongs to a parent
          // structure and break gracefully (error handled by parent or Document).
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

      // Raise error if bracket is not closed
      if (!bracketClose) {
        p.error(`Unclosed Brackets: Expected '${jsTokens.bracketEnd}'`, bracketOpen);
      }

      // Return structure whether closed or unclosed
      return {
        type: "Brackets",
        children,
        start: bracketOpen.start,
        end: bracketClose ? bracketClose.end : bracketOpen.end
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
