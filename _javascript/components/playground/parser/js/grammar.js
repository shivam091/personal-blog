import { INSIGNIFICANT_TOKENS } from "./../constants";

export const jsGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];
      while (!p.eof()) {
        const node = p.oneOf(["Block", "Parentheses", "Brackets", "Comment", "SingleComment", "Template", "JSX"]);
        if (node) { children.push(node); continue; }

        const next = p.peek();
        if (next && ["BLOCK_CLOSE", "PAREN_CLOSE", "BRACKET_CLOSE"].includes(next.type)) {
          p.error(`Unexpected closing delimiter: ${next.value}`, next);
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

    SingleComment(p) {
      const t = p.matchType("SINGLE_COMMENT");
      return t ? { type: "Comment", start: t.start, end: t.end } : null;
    },

    Template(p) {
      const t = p.matchType("TEMPLATE");
      return t ? { type: "Template", start: t.start, end: t.end } : null;
    },

    JSX(p) {
      const t = p.matchType("JSX");
      return t ? { type: "JSX", start: t.start, end: t.end } : null;
    },

    Block(p) {
      const blockOpen = p.matchType("BLOCK_OPEN");
      if (!blockOpen) return null;
      const children = [];
      let blockClose = null;

      while (true) {
        const next = p.peek();
        if (!next) break;
        if (next.type === "BLOCK_CLOSE") { blockClose = p.next(); break; }

        if (next.type === "PAREN_CLOSE" || next.type === "BRACKET_CLOSE") {
          // lookahead to see if a BLOCK_CLOSE follows ignoring insignificant tokens
          let offset = 1;
          let lookahead = p.peek(offset);
          while (lookahead && INSIGNIFICANT_TOKENS.includes(lookahead.type)) { offset++; lookahead = p.peek(offset); }
          if (lookahead && lookahead.type === "BLOCK_CLOSE") {
            p.error(`Unexpected '${next.value}' inside block.`, next);
            p.next(); continue;
          }
          break;
        }

        const child = p.oneOf(["Block", "Parentheses", "Brackets", "Comment", "SingleComment", "Template", "JSX"]);
        if (child) { children.push(child); continue; }

        p.next();
      }

      if (!blockClose) p.error(`Unclosed JavaScript Block: Expected '}'`, blockOpen);

      return { type: "Block", children, start: blockOpen.start, end: blockClose ? blockClose.end : blockOpen.end };
    },

    Parentheses(p) {
      const parenOpen = p.matchType("PAREN_OPEN");
      if (!parenOpen) return null;
      const children = [];
      let parenClose = null;

      while (true) {
        const next = p.peek();
        if (!next) break;
        if (next.type === "PAREN_CLOSE") { parenClose = p.next(); break; }

        if (next.type === "BLOCK_CLOSE" || next.type === "BRACKET_CLOSE") {
          let offset = 1;
          let lookahead = p.peek(offset);
          while (lookahead && INSIGNIFICANT_TOKENS.includes(lookahead.type)) { offset++; lookahead = p.peek(offset); }
          if (lookahead && lookahead.type === "PAREN_CLOSE") {
            p.error(`Unexpected '${next.value}' inside parenthesis.`, next);
            p.next(); continue;
          }
          break;
        }

        const child = p.oneOf(["Block", "Parentheses", "Brackets", "Comment", "SingleComment", "Template", "JSX"]);
        if (child) { children.push(child); continue; }
        p.next();
      }

      if (!parenClose) p.error(`Unclosed Parentheses: Expected ')'`, parenOpen);
      return { type: "Parentheses", children, start: parenOpen.start, end: parenClose ? parenClose.end : parenOpen.end };
    },

    Brackets(p) {
      const bracketOpen = p.matchType("BRACKET_OPEN");
      if (!bracketOpen) return null;
      const children = [];
      let bracketClose = null;

      while (true) {
        const next = p.peek();
        if (!next) break;
        if (next.type === "BRACKET_CLOSE") { bracketClose = p.next(); break; }

        if (next.type === "BLOCK_CLOSE" || next.type === "PAREN_CLOSE") {
          let offset = 1;
          let lookahead = p.peek(offset);
          while (lookahead && INSIGNIFICANT_TOKENS.includes(lookahead.type)) { offset++; lookahead = p.peek(offset); }
          if (lookahead && lookahead.type === "BRACKET_CLOSE") {
            p.error(`Unexpected '${next.value}' inside bracket.`, next);
            p.next(); continue;
          }
          break;
        }

        const child = p.oneOf(["Block", "Parentheses", "Brackets", "Comment", "SingleComment", "Template", "JSX"]);
        if (child) { children.push(child); continue; }
        p.next();
      }

      if (!bracketClose) p.error(`Unclosed Brackets: Expected ']'`, bracketOpen);
      return { type: "Brackets", children, start: bracketOpen.start, end: bracketClose ? bracketClose.end : bracketOpen.end };
    },

    WHITESPACE: (p) => p.matchType("WHITESPACE"),
    TAB: (p) => p.matchType("TAB"),
    NEWLINE: (p) => p.matchType("NEWLINE")
  }
};
