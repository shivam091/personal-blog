import { INSIGNIFICANT_TOKENS } from "../constants";

export const cssGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];

      while (!p.eof()) {
        // Try to match structural nodes
        const node = p.oneOf(["Block", "Comment", "FunctionCall"]);
        if (node) {
          children.push(node);
          continue;
        }

        // Explicitly check for unmatched closing brace
        const next = p.peek();
        if (next) {
          if (next.type === "BLOCK_CLOSE") {
            p.error(`Unexpected closing brace '}' outside a block.`, next);
            p.next(); // Consume the error token and continue
            continue;
          }
          if (next.type === "PAREN_CLOSE") {
            p.error(`Unexpected closing parenthesis ')' outside a function.`, next);
            p.next();
            continue;
          }
        }

        // Explicitly consume known insignificant tokens
        if (p.oneOf(...INSIGNIFICANT_TOKENS)) continue;

        // Consume all other tokens (selectors, properties, newlines, etc.)
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

        const child = p.oneOf(["Block", "Comment", "FunctionCall"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Explicitly consume known insignificant tokens
        if (p.oneOf(...INSIGNIFICANT_TOKENS)) continue;

        // Consume all other text/unknown tokens (like newlines or actual text content)
        p.next();
      }

      // Error Handling: If the loop exited because of EOF, the block is unclosed.
      if (!blockClose) {
        p.error(`Unclosed CSS Block: Expected '}'`, blockOpen);
        // Continue, but define the block's end at the last consumed token.
        return {
          type: "Block",
          children,
          start: blockOpen.start,
          end: p.tokens.at(-1)?.end || blockOpen.end
        };
      }

      return {
        type: "Block",
        children,
        start: blockOpen.start,
        end: blockClose.end
      };
    },

    FunctionCall(p) {
      // 1. Match the function name token
      const funcToken = p.matchType("CSS_FUNCTION");
      if (!funcToken) return null;

      // The FunctionCall node will be a Parentheses type for fold analysis
      const node = {
        type: "Parentheses", // For folding/structural analysis
        start: funcToken.start,
        children: []
      };

      // 2. Match the opening parenthesis
      const parenOpen = p.matchType("PAREN_OPEN");
      if (!parenOpen) {
        // This should ideally not happen if the lexer is correct, but handles a mismatch
        p.error(`Expected '(' after function '${funcToken.value}'`, funcToken);
        node.end = funcToken.end;
        return node;
      }

      // 3. Consume content until closing parenthesis
      let parenClose = null;
      while (true) {
        const next = p.peek();
        if (!next) break;

        if (next.type === "PAREN_CLOSE") {
          parenClose = p.next();
          break;
        }

        if (next.type === "SEMICOLON" || next.type === "BLOCK_CLOSE") {
          p.error(`Unclosed CSS function call: Expected ')'`, funcToken);
          break; // Stop parsing function content and return to the Block rule
        }

        // Nested parsing: check for nested blocks, comments, or other function calls
        const child = p.oneOf(["Block", "Comment", "FunctionCall"]);
        if (child) {
          node.children.push(child);
          continue;
        }

        // Consume all other tokens (values, operators, etc.)
        p.next();
      }

      // Set end position. If parenClose is null, use the last position before the break.
      if (!parenClose) {
        node.end = p.tokens.at(-1)?.end || parenOpen.end;
      } else {
        node.end = parenClose.end;
      }

      return node;
    },

    // Rule to match and consume a single WHITESPACE token.
    WHITESPACE: (p) => p.matchType("WHITESPACE"),

    // Rule to match and consume a single TAB token.
    TAB: (p) => p.matchType("TAB"),

    // Rule to match and consume a newline token.
    NEWLINE: (p) => p.matchType("NEWLINE"),
  }
};
