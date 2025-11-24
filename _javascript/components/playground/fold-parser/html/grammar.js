import { htmlTokens } from "./constants";

export const htmlGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];

      while (!p.eof()) {
        // Added "ProcessingInstruction" to the top-level document rules
        const node = p.oneOf(["ProcessingInstruction", "Doctype", "Element", "Comment", "Content", "Entity", "Cdata"]);

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

    Entity(p) {
        const t = p.matchType("ENTITY");
        return t ? { type: "Entity", start: t.start, end: t.end, value: t.value } : null;
    },

    Doctype(p) {
        const t = p.matchType("DOCTYPE");
        return t ? { type: "Doctype", start: t.start, end: t.end, value: t.value } : null;
    },

    Cdata(p) {
        const t = p.matchType("CDATA");
        return t ? { type: "Cdata", start: t.start, end: t.end, value: t.value } : null;
    },

    // New rule for Processing Instructions
    ProcessingInstruction(p) {
        const t = p.matchType("PROCESSING_INSTRUCTION");
        return t ? { type: "ProcessingInstruction", start: t.start, end: t.end, value: t.value } : null;
    },

    Element(p) {
      const openToken = p.matchType("TAG_OPEN");
      if (!openToken) return null;

      const attributes = p.apply("AttributeList");

      let openTagEndBracket = p.matchType("PUNCTUATION", htmlTokens.tagEnd);

      const children = [];
      let closeToken = null;

      while (true) {
        const next = p.peek();
        if (!next) break;

        if (next.type === "TAG_CLOSE") {
          closeToken = p.next();

          p.matchType("PUNCTUATION", htmlTokens.tagEnd);
          break;
        }

        // Includes all potential inner nodes
        const child = p.oneOf(["Element", "Comment", "Content", "Entity", "Cdata", "ProcessingInstruction"]);
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
        end: nameToken.end
      };
    },

    AttributeValue(p) {
      let valueToken = p.matchType("ATTRIBUTE_VALUE_QUOTED") || p.matchType("ATTRIBUTE_VALUE_UNQUOTED");

      if (!valueToken) {
          return null;
      }

      let innerValue = valueToken.value;

      if (valueToken.type === 'ATTRIBUTE_VALUE_QUOTED' && innerValue.length >= 2) {
          innerValue = innerValue.slice(1, -1);
      }

      return {
        type: "AttributeValue",
        value: innerValue,
        start: valueToken.start,
        end: valueToken.end
      };
    }
  }
};
