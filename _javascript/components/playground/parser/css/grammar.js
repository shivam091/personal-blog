import { INSIGNIFICANT_TOKENS } from "../constants";
import { cssTokens } from "./tokens";

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
        if (next && next.type === "BLOCK_CLOSE") {
          p.error(`Unexpected closing brace '${cssTokens.braceEnd}' outside a block.`, next);
          p.next(); // Consume the error token and continue
          continue;
        }

        // Consume insignificant tokens
        if (p.oneOf(...INSIGNIFICANT_TOKENS)) continue;

        // Consume all other tokens (selectors, properties, newlines, etc.)
        p.next();
      }

      // Final Document node
      return { type: "Document", children, start: 0, end: p.tokens.at(-1)?.end || 0 };
    },

    // Rule to match and consume a comment.
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
        p.error(`Unclosed CSS comment: Expected '${cssTokens.commentEnd}'`, commentOpen);
      }

      return {
        type: "Comment",
        start: commentOpen.start,
        end: commentClose ? commentClose.end : commentOpen.end
      };
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

        // Consume all other text/unknown tokens
        p.next();
      }

      // Raise error if block is not closed
      if (!blockClose) {
        p.error(`Unclosed CSS Block: Expected '${cssTokens.braceEnd}'`, blockOpen);
      }

      // Return structure whether closed or unclosed
      return {
        type: "Block",
        children,
        start: blockOpen.start,
        end: blockClose ? blockClose.end : blockOpen.end
      };
    },

    // Rule to match and consume a single WHITESPACE token.
    WHITESPACE: (p) => p.matchType("WHITESPACE"),

    // Rule to match and consume a single TAB token.
    TAB: (p) => p.matchType("TAB"),
  }
};
