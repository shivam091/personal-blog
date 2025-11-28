import { INSIGNIFICANT_TOKENS } from "../constants";

export const cssGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];

      while (!p.eof()) {
        // Try to match structural nodes
        const node = p.oneOf(["Block", "Comment", "FunctionCall", "AtRule", "Parentheses"]);
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
        }

        // Consume all other tokens
        const content = p.oneOf(["NUMBER", "UNIT", "COLOR", "IDENTIFIER", "COLON", "ID_SELECTOR", "TEXT", "STRING"]);
        if (content) {
          children.push(content);
          continue;
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

        // Nested parsing: check for structural elements
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

    // Handles independent parentheses structures like those in media queries.
    Parentheses(p) {
      const parenOpen = p.matchType("PAREN_OPEN");
      if (!parenOpen) return null;

      const children = [];
      let parenClose = null;

      while (true) {
        const next = p.peek();
        if (!next) break;

        if (next.type === "PAREN_CLOSE") {
          parenClose = p.next();
          break;
        }

        // Allow nested structures
        const child = p.oneOf(["Block", "Comment", "FunctionCall", "Parentheses"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Consume insignificant tokens
        if (p.oneOf(...INSIGNIFICANT_TOKENS)) continue;

        // Consume all other content tokens
        p.next();
      }

      if (!parenClose) {
        p.error(`Unclosed Parentheses: Expected ')'`, parenOpen);

        return {
          type: "Parentheses",
          children,
          start: parenOpen.start,
          end: p.tokens.at(-1)?.end || parenOpen.end
        };
      }

      return {
        type: "Parentheses",
        children,
        start: parenOpen.start,
        end: parenClose.end
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
        const child = p.oneOf(["Block", "Comment", "FunctionCall", "Parentheses"]);
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

    AtRule(p) {
      const atRuleToken = p.matchType("AT_RULE");
      if (!atRuleToken) return null;

      const children = [];
      let endToken = null;

      // AT-RULES come in two main forms:
      // 1. Rules with a body: @media screen { ... } or @keyframes name { ... }
      // 2. Rules that end with a semicolon: @import url; or @charset "UTF-8";

      while (true) {
        const next = p.peek();
        if (!next) break;

        // 1. Found an opening block brace: {
        if (next.type === "BLOCK_OPEN") {
          const block = p.oneOf(["Block"]); // Consume the entire block structure
          if (block) {
            children.push(block);
            endToken = block; // Store the Block node
          }
          break; // Stop parsing the at-rule contents
        }

        // 2. Found the closing semicolon: ;
        if (next.type === "SEMICOLON") {
          endToken = p.next(); // Consume the Semicolon token
          break; // Stop parsing the at-rule contents
        }

        // 3. Structural Break (start of a new rule set or another AT_RULE)
        if (next.type === "AT_RULE" || next.type === "IDENTIFIER" || p.eof()) {
          // If we hit another AT_RULE or an IDENTIFIER (start of a selector)
          // it means the current at-rule implicitly ended (it was missing a ; or { })
          break;
        }

        // Handle Parentheses (for media/supports queries) ***
        const paren = p.oneOf(["Parentheses"]);
        if (paren) {
          children.push(paren);
          continue;
        }

        // Handle nested structures that may appear in the rule's preamble (e.g., in @media or @supports)
        const child = p.oneOf(["FunctionCall", "Comment"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Consume insignificant tokens
        if (p.oneOf(...INSIGNIFICANT_TOKENS)) continue;

        // Consume all other content tokens (conditions, values, etc.)
        p.next();
      }

      // Error Handling: If we stopped without consuming the required delimiter ({ or ;).
      if (!endToken) {
        p.error(`Missing closing delimiter for At-Rule: Expected ';' or '{'`, atRuleToken);
      }

      return {
        type: "AtRule",
        name: atRuleToken.value,
        children,
        start: atRuleToken.start,
        // The end is the last consumed token, or the start if nothing followed
        end: endToken ? endToken.end : p.tokens.at(-1)?.end || atRuleToken.end
      };
    },

    // Rule to match and consume a single WHITESPACE token.
    WHITESPACE: (p) => p.matchType("WHITESPACE"),

    // Rule to match and consume a single TAB token.
    TAB: (p) => p.matchType("TAB"),

    // Rule to match and consume a newline token.
    NEWLINE: (p) => p.matchType("NEWLINE"),

    // Rule to match and consume a number token.
    NUMBER: (p) => p.matchType("NUMBER"),

    // Rule to match and consume a unit token.
    UNIT: (p) => p.matchType("UNIT"),

    // Rule to match and consume a color token.
    COLOR: (p) => p.matchType("COLOR"),

    // Rule to match and consume an ID Selector token.
    ID_SELECTOR: (p) => p.matchType("ID_SELECTOR")
  }
};
