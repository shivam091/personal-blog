import { INSIGNIFICANT_TOKENS } from "./../constants";
import { htmlTokens } from "./constants";

const OPTIONAL_CLOSE_TAGS = new Set([
  "li","dt","dd","p","rt","rp","optgroup","option","thead","tbody","tfoot","tr","td","th"
]);

export const htmlGrammar = {
  startRule: "Document",
  rules: {
    Document(p) {
      const children = [];
      while (!p.eof()) {
        const node = p.oneOf(["Element", "Comment", "RAW_SCRIPT", "RAW_STYLE", "NEWLINE"]);
        if (node) {
          children.push(node);
          continue;
        }

        const next = p.peek();
        if (next && next.type === "TAG_CLOSE") {
          // unexpected closing tag
          if (next.value && next.value.startsWith("</")) {
            p.error(`Unexpected closing HTML tag: ${next.value}`, next);
            p.next();
            continue;
          }
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

    // Raw script/style tokens are consumed as single nodes to allow folding by their surrounding tags.
    RAW_SCRIPT(p) {
      const t = p.matchType("RAW_SCRIPT");
      if (!t) return null;
      return { type: "RawScript", start: t.start, end: t.end };
    },
    RAW_STYLE(p) {
      const t = p.matchType("RAW_STYLE");
      if (!t) return null;
      return { type: "RawStyle", start: t.start, end: t.end };
    },

    Element(p) {
      const startPos = p.pos;
      const tagOpen = p.matchType("TAG_OPEN");
      if (!tagOpen) return null;

      // extract open tag name
      const openTagMatch = tagOpen.value.match(/^<\s*([A-Za-z0-9\-\:_]+)/);
      const openTagName = openTagMatch ? openTagMatch[1].toLowerCase() : null;

      // Void element: do not fold (return immediately)
      const isVoid = openTagName && (htmlTokens.voidElements || new Set()).has(openTagName);

      if (isVoid) {
        return { type: "Element", name: openTagName, children: [], start: tagOpen.start, end: tagOpen.end };
      }

      // If tag had '/>' (self-closing), treat as single element
      if (/\/>$/.test(tagOpen.value)) {
        return { type: "Element", name: openTagName, children: [], start: tagOpen.start, end: tagOpen.end };
      }

      const children = [];
      let tagClose = null;

      while (true) {
        const next = p.peek();
        if (!next) break;

        // If we hit a TAG_CLOSE and it matches name, consume and finish.
        if (next.type === "TAG_CLOSE") {
          const closeVal = next.value;
          const m = closeVal.match(/^<\/\s*([A-Za-z0-9\-\:_]+)/);
          const closeName = m ? m[1].toLowerCase() : null;
          p.next();
          if (!openTagName || !closeName || openTagName === closeName) {
            tagClose = next;
            break;
          } else {
            // mismatched closing tag: if it's for a tag that implies optional closing, keep going.
            // Backtrack: if next closes a parent, we should allow parent to handle it.
            // For folding, if mismatched, treat closing tag as sibling and continue.
            // Put token back? Parser framework may not support un-next; we simply treat as error and continue.
            p.error(`Mismatched closing tag: expected </${openTagName}> but found ${closeVal}`, next);
            continue;
          }
        }

        // Nested Elements / Comments / Raw contents
        const child = p.oneOf(["Element", "Comment", "RAW_SCRIPT", "RAW_STYLE"]);
        if (child) {
          children.push(child);
          continue;
        }

        // Consume insignificant tokens
        if (p.oneOf(...INSIGNIFICANT_TOKENS)) {
          p.next();
          continue;
        }

        // Safety: if we reach another opening tag for an element that is allowed to implicitly close this one,
        // check optional closers (like <li>, <p>)
        const maybeOpen = p.peek();
        if (maybeOpen && maybeOpen.type === "TAG_OPEN") {
          const nm = maybeOpen.value.match(/^<\s*([A-Za-z0-9\-\:_]+)/);
          const nmName = nm ? nm[1].toLowerCase() : null;
          if (OPTIONAL_CLOSE_TAGS.has(openTagName) && nmName) {
            // Implicit close — stop folding this element, leave next TAG_OPEN to parent
            break;
          }
        }

        // consume others
        p.next();
      }

      if (!tagClose) {
        // unclosed, but still return node for folding
        p.error(`Unclosed HTML Element: Expected closing tag for ${openTagName || tagOpen.value}`, tagOpen);
        return { type: "Element", name: openTagName, children, start: tagOpen.start, end: tagOpen.end };
      }

      return { type: "Element", name: openTagName, children, start: tagOpen.start, end: tagClose.end };
    },

    WHITESPACE: (p) => p.matchType("WHITESPACE"),
    TAB: (p) => p.matchType("TAB"),
    NEWLINE: (p) => p.matchType("NEWLINE")
  }
};
