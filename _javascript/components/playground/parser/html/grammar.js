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

      // Extract the tag name from the opening token's value
      const openTagMatch = tagOpen.value.match(/<([a-zA-Z0-9_-]+)/);
      const openTagName = openTagMatch ? openTagMatch[1].toLowerCase() : null;

      const children = [];
      let tagClose = null;

      // --- Common logic: Consume all attributes and tokens until the closing boundary ---
      let lastConsumedToken = tagOpen;

      while (true) {
        const next = p.peek();
        if (!next) break;

        // Check for the three possible end tokens that stop attribute parsing:
        // 1. Regular closing tag start: </
        if (next.type === "TAG_CLOSE") break;
        // 2. Self-closing tag end: /> (will be tokenized as TAG_CLOSING_SLASH then TAG_SELF_CLOSE_END)
        if (next.type === "TAG_SELF_CLOSE_END") break;
        // 3. Regular opening tag end: >
        if (next.type === "PUNCTUATION" && next.value === '>') break;

        // Consume everything else (attributes, punctuation, self-closing slash, etc.)
        lastConsumedToken = p.next();
      }

      // Check the final token to determine element type
      const finalToken = p.peek();

      // 1. Handle Void/Self-Closing Elements (ends with />)
      if (finalToken && finalToken.type === "TAG_SELF_CLOSE_END") {
        lastConsumedToken = p.next(); // Consume the final '>'
        return {
          type: "Element",
          name: openTagName,
          isVoid: true,
          children: [],
          start: tagOpen.start,
          end: lastConsumedToken.end // End must be the end of the consumed TAG_SELF_CLOSE_END ('>')
        };
      }

      // 2. Handle Implicit Void Elements (e.g., `<br>` without `/>`)
      // These elements are singletons and should not have children.
      if (openTagName && htmlTokens.voidElements.has(openTagName)) {
          // Consume the final '>' of the tag if it exists (PUNCTUATION token)
          if (finalToken && finalToken.type === "PUNCTUATION" && finalToken.value === '>') {
              lastConsumedToken = p.next();
          }

          return {
            type: "Element",
            name: openTagName,
            isVoid: true,
            children: [],
            start: tagOpen.start,
            end: lastConsumedToken.end
          };
      }

      // 3. Handle Regular Elements (open: <div>)
      // Consume the final '>' of a non-self-closing tag if present
      if (finalToken && finalToken.type === "PUNCTUATION" && finalToken.value === '>') {
          p.next();
      }

      // Continue parsing children (nested Elements, Comments, Content) until we hit a closing tag
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

        // Consume insignificant tokens
        if (p.oneOf(...INSIGNIFICANT_TOKENS)) continue;

        // Consume all other tokens (TEXT, CONTENT, INSIGNIFICANT, etc.)
        lastConsumedToken = p.next();
      }

      // Return structure for regular element (may be unclosed if tagClose is null)
      return {
        type: "Element",
        name: openTagName,
        children,
        start: tagOpen.start,
        // Use the end of the closing tag or the last consumed token/opening tag end
        end: (tagClose || lastConsumedToken)?.end || tagOpen.end
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
