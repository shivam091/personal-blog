import { INSIGNIFICANT_TOKENS } from "./../constants";

export const cssGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];
      while (!p.eof()) {
        const node = p.oneOf(["Block", "Comment"]);
        if (node) { children.push(node); continue; }

        const next = p.peek();
        if (next && next.type === "BLOCK_CLOSE") {
          p.error(`Unexpected closing brace '}' outside a block.`, next);
          p.next();
          continue;
        }

        if (p.oneOf(...INSIGNIFICANT_TOKENS)) continue;
        p.next();
      }
      return { type: "Document", children, start: 0, end: p.tokens.at(-1)?.end || 0 };
    },

    Comment(p) {
      const t = p.matchType("COMMENT");
      return t ? { type: "Comment", start: t.start, end: t.end } : null;
    },

    Block(p) {
      const blockOpen = p.matchType("BLOCK_OPEN");
      if (!blockOpen) return null;

      const children = [];
      let blockClose = null;

      while (true) {
        const next = p.peek();
        if (!next) break;

        if (next.type === "BLOCK_CLOSE") {
          blockClose = p.next();
          break;
        }

        const child = p.oneOf(["Block", "Comment"]);
        if (child) { children.push(child); continue; }

        // Parentheses can contain complex content; we don't build a deep tree but we consume balanced parentheses for folding stability.
        if (next.type === "PAREN_OPEN") {
          // consume until matching PAREN_CLOSE
          let depth = 0;
          while (!p.eof()) {
            const t = p.peek();
            if (!t) break;
            if (t.type === "PAREN_OPEN") depth++;
            if (t.type === "PAREN_CLOSE") {
              depth--;
              p.next();
              if (depth <= 0) break;
              continue;
            }
            p.next();
          }
          continue;
        }

        p.next();
      }

      if (!blockClose) {
        p.error(`Unclosed CSS Block: Expected '}'`, blockOpen);
      }

      return { type: "Block", children, start: blockOpen.start, end: blockClose ? blockClose.end : blockOpen.end };
    },

    WHITESPACE: (p) => p.matchType("WHITESPACE"),
    TAB: (p) => p.matchType("TAB"),
  }
};
