import { INSIGNIFICANT_TOKENS } from "../constants";

export const htmlGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];

      while (!p.eof()) {
        // Try to match structural nodes
        const node = p.oneOf(["Element", "Comment", "NEWLINE"]);
        if (node) {
          children.push(node);
          continue;
        }

        // Consume insignificant tokens
        if (p.oneOf(...INSIGNIFICANT_TOKENS)) continue;

        // Consume all other text/unknown tokens
        p.next();
      }

      // Final Document node
      return { type: "Document", children, start: 0, end: p.tokens.at(-1)?.end || 0 };
    },

    // Rule to match and consume a comment.
    Comment(p) {
      const t = p.matchType("COMMENT");

      return t ? { type: "Comment", start: t.start, end: t.end } : null;
    },

    Element(p) {
      const tagOpen = p.matchType("TAG_OPEN");
      if (!tagOpen) return null;

      const children = [];
      let tagClose = null;

      // Continue parsing children (nested Elements, Comments) until we hit a closing tag
      while (true) {
        const next = p.peek();
        if (!next) break;

        // Stop if we find a closing tag token
        if (next.type === "TAG_CLOSE") {
          tagClose = p.next();
          break;
        }

        // Recursively parse nested elements or comments
        const child = p.oneOf(["Element", "Comment"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Consume all other tokens (including insignificant ones)
        p.next();
      }

      // Extract the name from the opening tag (e.g., "div" from "<div id='x'>")
      const openTagMatch = tagOpen.value.match(/<([a-zA-Z0-9]+)/);
      const openTagName = openTagMatch ? openTagMatch[1].toLowerCase() : null;

      // Return structure whether closed or unclosed
      return {
        type: "Element",
        name: tagOpen.value,
        children,
        start: tagOpen.start,
        end: (tagClose || p.tokens.at(-1))?.end || tagOpen.end // Use the end of the closing tag or the last consumed token
      };
    },

    // Rule to match and consume a single WHITESPACE token.
    WHITESPACE: (p) => p.matchType("WHITESPACE"),

    // Rule to match and consume a single TAB token.
    TAB: (p) => p.matchType("TAB"),

    // Rule to match and consume a new line.
    NEWLINE: (p) => p.matchType("NEWLINE"),

    // Rule to match and consume the large TEXT token groups.
    TEXT: (p) => p.matchType("TEXT"),
  }
};
