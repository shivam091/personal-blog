import { INSIGNIFICANT_TOKENS } from "../constants";

export const cssGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];

      while (!p.eof()) {
        // Try to match structural nodes
        const node = p.oneOf(["Block", "FunctionCall", "Comment", "NEWLINE"]);
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

        // Recursively parse nested blocks, function calls, or comments.
        const child = p.oneOf(["Block", "FunctionCall", "Comment"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Consume all other text/unknown tokens
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

    // Rule to match and consume function callssss
    FunctionCall(p) {
      // 1. Must start with a FUNCTION token
      const funcToken = p.matchType("FUNCTION");
      if (!funcToken) return null;

      // 2. Must be immediately followed by the opening parenthesis
      const parenOpen = p.matchType("PAREN_OPEN");

      const children = [];
      let parenClose = null;

      // Look for nested content until the closing parenthesis
      while (true) {
        const next = p.peek();
        if (!next) break;

        if (next.type === "PAREN_CLOSE") {
          parenClose = p.next();
          break;
        }

        // Recursively parse nested blocks, function calls, or comments.
        const child = p.oneOf(["Block", "FunctionCall", "Comment"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Consume all other text/unknown tokens
        p.next();
      }

      // Return structure whether closed or unclosed
      return {
        type: "FunctionCall",
        children,
        start: funcToken.start,
        end: (parenClose || p.tokens.at(-1))?.end || funcToken.end
      };
    },

    // Rule to match and consume a single WHITESPACE token.
    WHITESPACE: (p) => p.matchType("WHITESPACE"),

    // Rule to match and consume a single TAB token.
    TAB: (p) => p.matchType("TAB"),

    // Rule to match and consume a new line.
    NEWLINE: (p) => p.matchType("NEWLINE"),

    // Rule to match and consume a string token.
    STRING: (p) => p.matchType("STRING"),

    // Rule to match and consume a error string token.
    ERROR_STRING: (p) => p.matchType("ERROR_STRING"),

    // Rule to match and consume a parenthesis open token.
    PAREN_OPEN: (p) => p.matchType("PAREN_OPEN"),

    // Rule to match and consume a parenthesis close token.
    PAREN_CLOSE: (p) => p.matchType("PAREN_CLOSE"),

    // Rule to match and consume class selector.
    CLASS_SELECTOR: (p) => p.matchType("CLASS_SELECTOR"),

    // Rule to match and consume a number token.
    NUMBER: (p) => p.matchType("NUMBER"),

    // Rule to match and consume a unit token.
    UNIT: (p) => p.matchType("UNIT"),

    // Rule to match and consume hex color code.
    HEX_COLOR: (p) => p.matchType("HEX_COLOR"),

    // Rule to match and consume ID Selector.
    ID_SELECTOR: (p) => p.matchType("ID_SELECTOR"),

    // Rule to match and consume function.
    FUNCTION: (p) => p.matchType("FUNCTION"),

    // Rule to match and consume identifiers.
    IDENTIFIER: (p) => p.matchType("IDENTIFIER"),

    // Rule to match and consume properties.
    PROPERTY: (p) => p.matchType("PROPERTY"),

    // Rule to match and consume custom properties.
    CUSTOM_PROPERTY: (p) => p.matchType("CUSTOM_PROPERTY"),

    // Rule to match and consume color keyword.
    COLOR_KEYWORD: (p) => p.matchType("COLOR_KEYWORD"),

    // Rule to match and consume pseudo classes.
    PSEUDO_CLASS: (p) => p.matchType("PSEUDO_CLASS"),

    // Rule to match and consume pseudo elements.
    PSEUDO_ELEMENT: (p) => p.matchType("PSEUDO_ELEMENT"),

    // Rule to match and consume property value keywords.
    VALUE_KEYWORD: (p) => p.matchType("VALUE_KEYWORD"),

    // Rule to match and consume error token.
    ERROR_TOKEN: (p) => p.matchType("ERROR_TOKEN"),

    // Rule to match and consume the UNKNOWN token groups.
    UNKNOWN: (p) => p.matchType("UNKNOWN"),
  }
};
