export const htmlGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];

      while (!p.eof()) {
        const node = p.oneOf(["Element", "Comment"]);

        if (!node) {
          // Consume any non-structural token to prevent infinite loop
          p.next();
          continue;
        }

        children.push(node);
      }

      return { type: "Document", children };
    },

    Comment(p) {
      const t = p.matchType("COMMENT");

      return t ? { type: "Comment", start: t.start, end: t.end } : null;
    },

    /**
     * Parses a full HTML element, including its attributes and children.
     */
    Element(p) {
      const openTagStartToken = p.peek();
      if (!openTagStartToken || openTagStartToken.type !== "TAG_OPEN") return null;

      // We will parse the entire tag structure within the TAG_OPEN token's range
      // The attributes are already tokenized by the lexer and we will consume them now.

      // Consume the initial TAG_OPEN token which already includes the tag name
      const openToken = p.next();
      if (!openToken) return null;

      const attributes = p.apply("AttributeList"); // Parse the list of attributes

      // The tag ends either with the close bracket (if self-closing) or continues.
      // For structural folding, we assume the whole open section is consumed,
      // and look for the final TAG_CLOSE token later.

      const children = [];
      let closeToken = null;

      // Continue parsing children (nested Elements, Comments, or plain content) until we hit a closing tag
      while (true) {
        const next = p.peek();
        if (!next) break;

        // Stop if we find a closing tag token
        if (next.type === "TAG_CLOSE") {
          closeToken = p.next();
          break;
        }

        // Recursively parse nested elements or comments
        const child = p.oneOf(["Element", "Comment"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Ignore non-structural/content tokens that are not fold nodes
        p.next();
      }

      // Requires a closing tag token to define the fold range
      if (!closeToken) return null;

      return {
        type: "Element",
        name: openToken.value,
        attributes: attributes, // Now includes the parsed attributes
        children,
        start: openToken.start,
        end: closeToken.end // Use the end of the closing tag token
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
