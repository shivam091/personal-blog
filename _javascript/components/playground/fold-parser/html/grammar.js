import { htmlTokens } from "./constants";

export const htmlGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];

      while (!p.eof()) {
        const node = p.oneOf(["Element", "Comment", "Content"]);

        if (!node) {
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

    Element(p) {
      const openToken = p.matchType("TAG_OPEN");
      if (!openToken) return null;

      const attributes = p.apply("AttributeList");

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

        const child = p.oneOf(["Element", "Comment", "Content"]);
        if (child) {
          children.push(child);
          continue;
        }

        p.next();
      }

      const closingEnd = closeToken ? closeToken.end : (openTagEndBracket ? openTagEndBracket.end : openToken.end);

      return {
        type: "Element",
        name: openToken.value,
        attributes: attributes,
        children,
        start: openToken.start,
        end: closingEnd
      };
    },

    AttributeList(p) {
      const attributes = [];
      let attr = null;

      while (attr = p.apply("Attribute")) {
        attributes.push(attr);
      }

      return attributes;
    },

    Attribute(p) {
      const nameToken = p.matchType("ATTRIBUTE_NAME");
      if (!nameToken) return null;

      let valueNode = null;

      if (p.matchType("PUNCTUATION", "=")) {
        valueNode = p.apply("AttributeValue");
      }

      return {
        type: "Attribute",
        name: nameToken.value,
        value: valueNode ? valueNode.value : true,
        start: nameToken.start,
        end: valueNode ? valueNode.end : nameToken.end
      };
    },

    /*
      * Parses the attribute value (quoted or unquoted string).
      */
    AttributeValue(p) {
      // 1. Try to match a quoted value first
      let valueToken = p.matchType("ATTRIBUTE_VALUE_QUOTED");

      // 2. If quoted failed, try to match an unquoted value
      if (!valueToken) {
          valueToken = p.matchType("ATTRIBUTE_VALUE_UNQUOTED");
      }

      if (!valueToken) {
          // If neither token type is found, return null
          return null;
      }

      let innerValue = valueToken.value;

      // If quoted, strip the quotes for the final AST value
      if (valueToken.type === 'ATTRIBUTE_VALUE_QUOTED' && innerValue.length >= 2) {
          innerValue = innerValue.slice(1, -1);
      }
      // If unquoted, the value is already the raw content

      return {
        type: "AttributeValue",
        value: innerValue,
        start: valueToken.start,
        end: valueToken.end
      };
    }
  }
};
