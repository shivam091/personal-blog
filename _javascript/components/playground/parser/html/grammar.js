import { INSIGNIFICANT_TOKENS } from "../constants";
import { htmlTokens } from "./constants";

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

        // Explicitly check for an unmatched closing tag token
        const next = p.peek();
        if (next && next.type === "TAG_CLOSE") {
          // We only check if it starts with </ to be sure it's a closing tag
          if (next.value.startsWith("</")) {
            p.error(`Unexpected closing HTML tag: ${next.value}`, next);
            p.next(); // Consume the error token and continue
            continue;
          }
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
      const startPos = p.pos;
      const tagOpen = p.matchType("TAG_OPEN");
      if (!tagOpen) return null;

      const children = [];
      let tagClose = null;

      // Extract the name from the opening tag (e.g., "div" from "<div id='x'>")
      const openTagMatch = tagOpen.value.match(/<([a-zA-Z0-9]+)/);
      const openTagName = openTagMatch ? openTagMatch[1].toLowerCase() : null;

      // 1. VOID ELEMENT CHECK
      const isVoid = htmlTokens.voidElements.has(openTagName);

      // If it's a void element, we do NOT enter the while loop for children.
      if (isVoid) {
        // If a void element contains a closing slash ('/>')
        if (!tagOpen.value.includes("/>")) {
          // Error: Void element must be self-closed
          p.error(`Void element <${openTagName}> should be self-closing (e.g., ending with '/>').`, tagOpen);
        }

        // Return the node immediately, regardless of the error.
        return {
          type: "Element",
          name: openTagName,
          children: [],
          start: tagOpen.start,
          end: tagOpen.end // Constrain the end for safety
        };
      }

      // 2. NON-VOID ELEMENT PARSING

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

      // Check mismatched tags
      if (tagClose) {
        // Extract the name from the closing tag
        const closeTagMatch = tagClose.value.match(/<\/([a-zA-Z0-9]+)>/);
        const closeTagName = closeTagMatch ? closeTagMatch[1].toLowerCase() : null;

        // Check for mismatched tag names
        if (openTagName && closeTagName && openTagName !== closeTagName || isVoid) {
          // 1. Raise the error for the user
          p.error(`Mismatched closing tag: Expected </${openTagName}> but found ${tagClose.value}`, tagClose);

          // 2. Backtrack and return null (Prevents bad fold node)
          p.pos = startPos;
          return null;
        }
      }

      // Check for unclosed tags
      if (!tagClose) {
        p.error(`Unclosed HTML Element: Expected closing tag for ${openTagName || tagOpen.value}`, tagOpen);
      }

      // Return structure whether closed or unclosed
      return {
        type: "Element",
        name: openTagName,
        children,
        start: tagOpen.start,
        end: tagClose ? tagClose.end : tagOpen.end // Use the end of the closing tag or the last consumed token
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
