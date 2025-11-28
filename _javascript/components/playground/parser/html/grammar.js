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
          // Check if the closing tag actually starts with </ (to exclude self-closing tags,
          // though typically TAG_CLOSE handles only the closing token itself)
          if (next.value.startsWith("</")) {
            p.error(`Unexpected closing HTML tag: ${next.value}`, next);
            p.next(); // Consume the error token and continue
            continue;
          }
        }

        // Explicitly consume known insignificant tokens
        if (p.oneOf(["WHITESPACE", "TAB", "NEWLINE"])) {
          continue;
        }

        // Consume all other text/unknown tokens
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

        // Explicitly consume SPACE and TAB
        if (p.oneOf(["WHITESPACE", "TAB", "NEWLINE"])) {
          continue;
        }

        // Consume all other text/unknown tokens
        p.next();
      }

      // Error Handling: Ensure a closing tag was found.
      if (!tagClose) {
        // We consumed an opening tag but never found a closing tag token.
        p.error(`Unclosed HTML Element: Expected closing tag for ${tagOpen.value}`, tagOpen);
        // Continue, but return the element definition based only on the open tag
        return {
          type: "Element",
          name: tagOpen.value,
          children,
          start: tagOpen.start,
          // Since it's unclosed, its end is the last consumed token or the open tag itself.
          end: p.tokens.at(-1)?.end || tagOpen.end
        };
      }

      // 1. Extract the name from the opening tag (e.g., "div" from "<div id='x'>")
      const openTagMatch = tagOpen.value.match(/<([a-zA-Z0-9]+)/);
      const openTagName = openTagMatch ? openTagMatch[1].toLowerCase() : null;

      // 2. Extract the name from the closing tag (e.g., "p" from "</p>")
      const closeTagMatch = tagClose.value.match(/<\/([a-zA-Z0-9]+)>/);
      const closeTagName = closeTagMatch ? closeTagMatch[1].toLowerCase() : null;

      // 3. Error Handling: Check for mismatched tag names
      if (openTagName && closeTagName && openTagName !== closeTagName) {
        p.error(`Mismatched closing tag: Expected </${openTagName}> but found ${tagClose.value}`, tagClose);
      }

      // Success: Both open and close tags found
      return {
        type: "Element",
        name: tagOpen.value,
        children,
        start: tagOpen.start,
        end: tagClose.end // Use the end of the closing tag token
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
