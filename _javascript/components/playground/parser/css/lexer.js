import { BaseLexer } from "../base-lexer";
import { cssTokens } from "./constants";

export class CssLexer extends BaseLexer {
  run() {
    const s = this.input;
    const L = s.length;
    let i = 0;

    while (i < L) {
      const char = s[i]; // Peek at the current character

      // 1. Multi-line Comment
      if (s.startsWith(cssTokens.commentStart, i)) {
        const end = s.indexOf(cssTokens.commentEnd, i + 2);
        const j = end === -1 ? L : end + 2;
        this.add("COMMENT", s.slice(i, j), i, j, "cp-token-comment");
        i = j;
        continue;
      }

      // 2. Block Open
      if (char === cssTokens.braceStart) {
        this.add("BLOCK_OPEN", cssTokens.braceStart, i, i + 1);
        i++;
        continue;
      }

      // 3. Block Close
      if (char === cssTokens.braceEnd) {
        this.add("BLOCK_CLOSE", cssTokens.braceEnd, i, i + 1);
        i++;
        continue;
      }

      // 4. Whitespace
      if (char === " ") {
        this.add("WHITESPACE", char, i, i + 1, "editor-token-space");
        i++;
        continue;
      }

      // 5. Tab
      if (char === "\t") {
        this.add("TAB", char, i, i + 1, "editor-token-tab");
        i++;
        continue;
      }

      // 6. Ignore all other characters (including newlines and other content)
      i++;
    }

    return this.tokens;
  }
}
