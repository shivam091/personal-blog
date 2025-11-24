import { htmlTokens } from "./constants";

export const htmlGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];

      while (!p.eof()) {
        const node = p.oneOf(["Element", "Comment", "Content"]);

        if (!node) {
          // Consume any non-structural token to prevent infinite loop
          p.next();
          continue;
        }

        children.push(node);
      }

      return { type: "Document", children };
    },

    Content(p) {
      const t = p.matchType("CONTENT");
      return t ? { type: "Content", start: t.start, end: t.end, value: t.value } : null;
    },

    Comment(p) {
      const t = p.matchType("COMMENT");

      return t ? { type: "Comment", start: t.start, end: t.end } : null;
    },

    // Parses a full HTML element, including its attributes and children.
    Element(p) {
      const openToken = p.matchType("TAG_OPEN");
      if (!openToken) return null;

      const attributes = p.apply("AttributeList"); // Parse the list of attributes

      // Consume closing bracket of the opening tag (e.g., > or />)
      let openTagEndBracket = p.matchType("PUNCTUATION", htmlTokens.tagEnd);

      const children = [];
      let closeToken = null;

      // Parse content/children until we hit the corresponding closing tag
      while (true) {
        const next = p.peek();
        if (!next) break;

        // Stop if we find a closing tag token
        if (next.type === "TAG_CLOSE") {
          closeToken = p.next();

          // Must also consume the final '>' of the closing tag
          p.matchType("PUNCTUATION", htmlTokens.tagEnd);
          break;
        }

        // Recursively parse nested elements or comments
        const child = p.oneOf(["Element", "Comment", "Content"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Ignore non-structural tokens
        p.next();
      }

      const closingEnd = closeToken ? closeToken.end : (openTagEndBracket ? openTagEndBracket.end : openToken.end);

      return {
        type: "Element",
        name: openToken.value,
        attributes: attributes, // Now includes the parsed attributes
        children,
        start: openToken.start,
        end: closingEnd // Use the end of the closing tag token
      };
    },

    /**
     * Parses zero or more attributes within a tag.
     */
    AttributeList(p) {
      const attributes = [];
      let attr = null;

      // Loop as long as we find valid attribute definitions
      while (attr = p.apply("Attribute")) {
        attributes.push(attr);
      }

      return attributes;
    },

    /*
     * Parses a single attribute: NAME [= VALUE]
     */
    Attribute(p) {
      // Look for the attribute name token
      const nameToken = p.matchType("ATTRIBUTE_NAME");
      if (!nameToken) return null;

      // Optional value part: '=' and then a quoted string
      let valueNode = null;

      // Check for the '=' token
      if (p.matchType("PUNCTUATION", "=")) {
        // Check for the value token (must be a quoted string)
        valueNode = p.apply("AttributeValue");
      }

      return {
        type: "Attribute",
        name: nameToken.value,
        value: valueNode ? valueNode.value : true, // Value is true if boolean, otherwise the string value
        start: nameToken.start,
        end: valueNode ? valueNode.end : nameToken.end
      };
    },

    /*
     * Parses the attribute value (the quoted string).
     */
    AttributeValue(p) {
      const valueToken = p.matchType("ATTRIBUTE_VALUE");
      if (!valueToken) {
          p.error("Expected attribute value token (quoted string)", p.peek());
          return null;
      }

      // The token value includes the quotes, so we extract the inner content
      const innerValue = valueToken.value.slice(1, -1);

      return {
        type: "AttributeValue",
        value: innerValue,
        start: valueToken.start,
        end: valueToken.end
      };
    }
  }
};
