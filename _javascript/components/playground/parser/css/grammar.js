import { INSIGNIFICANT_TOKENS } from "../constants";

export const cssGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];

      while (!p.eof()) {
        // Try to match structural nodes
        const node = p.oneOf(["Block", "AtRule", "FunctionCall", "Comment", "NEWLINE"]);
        if (node) {
          children.push(node);
          continue;
        }

        // Consume insignificant tokens
        if (p.oneOf(...INSIGNIFICANT_TOKENS)) continue;

        // Error handling: Nothing else is allowed here.
        // const token = p.peek();
        // if (token) {
        //   // Found a token that is neither a structural node, nor insignificant.
        //   p.error(`Unexpected token outside of a CSS block: ${token.type}`, token);

        //   // To recover and continue parsing, consume the token.
        //   p.next();
        //   continue;
        // }

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

    AttributeSelector(p) {
      // 1. Must start with '['
      const attrOpen = p.matchType("ATTR_OPEN");
      if (!attrOpen) return null;

      const children = [];
      let lastToken = attrOpen;

      // 2. Expect the attribute name (mandatory)
      const attrName = p.oneOf(["ATTRIBUTE_NAME", "IDENTIFIER"]); // Allow any identifier if not a known attribute
      if (attrName) {
        children.push(attrName);
        lastToken = attrName;
      } else {
        // Error: Missing attribute name after '['
        p.error("Expected attribute name after '['", attrOpen);
      }

      // 3. Optional operator and value (e.g., = 'value', ~= 'value')
      const operator = p.oneOf(["ATTR_EQUAL", "ATTR_OPERATOR"]);
      if (operator) {
        children.push(operator);
        lastToken = operator;

        // Expect the value (STRING or IDENTIFIER)
        const value = p.oneOf(["STRING", "IDENTIFIER"]);
        if (value) {
          children.push(value);
          lastToken = value;
        } else {
          // Error: Operator present but value missing
          p.error("Expected attribute value after operator", operator);
        }
      }

      // 4. Must end with ']'
      const attrClose = p.matchType("ATTR_CLOSE");
      if (attrClose) {
        lastToken = attrClose;
      } else {
        // Error: Unclosed attribute selector
        p.error("Unclosed attribute selector: Expected ']'", lastToken);
      }

      return {
        type: "AttributeSelector",
        children,
        start: attrOpen.start,
        end: lastToken.end
      };
    },

    // Handles all @-rules. It must consume the entire rule.
    AtRule(p) {
      const atRuleToken = p.matchType("AT_RULE");
      if (!atRuleToken) return null;

      const children = [];
      let lastToken = atRuleToken;

      // Consume tokens until a semicolon (end of declaration) or an opening brace (start of block).
      while (true) {
        const next = p.peek();
        if (!next) break;

        // 1. End of a declaration (e.g., @import url(...) **;**)
        if (next.type === "SEMICOLON") {
          lastToken = p.next(); // Consume SEMICOLON (You may need to add SEMICOLON to your lexer)
          break;
        }

        // 2. Start of an At-Rule Block (e.g., @media screen **{**)
        if (next.type === "BLOCK_OPEN") {
          // Let the 'Block' rule handle the content, but we must consume the block token first.
          // This is complex, so for simplicity here, we'll try to find an IDENTIFIER/BLOCK after @RULE

          // Since the Block rule is recursive, we must call it here if it's a block-type at-rule
          const block = p.oneOf(["Block"]); // Block rule handles the whole {...}
          if (block) {
            children.push(block);
            lastToken = block;
            break; // Finished the At-Rule, including its nested block.
          }
          // If Block rule failed, and it was a BLOCK_OPEN, we consume the token and report error later
          if (next.type === "BLOCK_OPEN") {
             lastToken = p.next();
             break;
          }
        }

        // Recursively look for nested structures like function calls within the At-Rule declaration
        const child = p.oneOf(["Block", "FunctionCall", "Comment"]);
        if (child) {
          children.push(child);
          lastToken = child;
          continue;
        }

        // Consume all other non-structural tokens (IDENTIFIER, STRING, NUMBER, WHITESPACE, etc.)
        lastToken = p.next();
      }

      // The AtRule node spans from the '@' to the final semicolon or closing brace
      return {
        type: "AtRule",
        children,
        start: atRuleToken.start,
        end: lastToken.end
      };
    },

    SimpleSelector(p) {
      // Simple selectors can start with a tag name (like 'div') OR one of the other selector types.

      let startToken = p.peek();
      const children = [];

      // 1. Optional Tag Name (must be first)
      const tagName = p.matchType("TAG_NAME");
      if (tagName) {
        children.push(tagName);
      } else {
        startToken = p.peek(); // Update start if no tag name
      }

      // 2. Consume zero or more non-tag simple selectors in any order
      while (true) {
        const selectorPart = p.oneOf([
          "ID_SELECTOR",
          "CLASS_SELECTOR",
          "AttributeSelector",
          "PSEUDO_CLASS",
          "PSEUDO_ELEMENT"
        ]);

        if (selectorPart) {
          children.push(selectorPart);
        } else {
          break; // Stop if no more simple selector parts are found
        }
      }

      if (children.length === 0) return null; // Failed to match any part

      return {
        type: "SimpleSelector",
        children,
        start: tagName?.start || startToken.start,
        end: children.at(-1).end
      };
    },

    Selector(p) {
      // A selector starts with a SimpleSelector
      const children = [];
      const initialSelector = p.oneOf(["SimpleSelector"]);
      if (!initialSelector) return null;

      children.push(initialSelector);
      let lastToken = initialSelector;

      // Consume zero or more subsequent SimpleSelectors separated by combinators
      while (true) {
        // Optional: Match combinators (e.g., WHITESPACE for descendant, or other operators)
        const combinator = p.oneOf(["WHITESPACE", "COMMA"]); // COMMA separates selectors in a list

        // If we found a comma, the full Selector rule ends here (it's part of a list)
        if (combinator?.type === "COMMA") {
          // If you want to keep the comma in the list: children.push(combinator);
          p.back(1); // Put the COMMA back so the parent RuleSet can handle the selector list
          break;
        }

        // Look for the next simple selector group
        const nextSelector = p.oneOf(["SimpleSelector"]);

        if (nextSelector) {
          if (combinator) children.push(combinator); // Include the combinator if one was found
          children.push(nextSelector);
          lastToken = nextSelector;
        } else {
          if (combinator) p.back(1); // Put the non-leading combinator back if no selector follows
          break;
        }
      }

      return {
        type: "Selector",
        children,
        start: initialSelector.start,
        end: lastToken.end
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

    // Rule to match and consume a known tag name.
    TAG_NAME: (p) => p.matchType("TAG_NAME"),

    // Rule to match and consume error token.
    ERROR_TOKEN: (p) => p.matchType("ERROR_TOKEN"),

    // Rule to match and consume the UNKNOWN token groups.
    UNKNOWN: (p) => p.matchType("UNKNOWN"),
  }
};
