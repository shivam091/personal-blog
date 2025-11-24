import { BaseLexer } from "./../base-lexer";
import { cssTokens } from "./constants";

export class CssLexer extends BaseLexer {
  run() {
    const s = this.input;
    const L = s.length;
    let i = 0;

    while (i < L) {
      // 1. Multi-line Comment
      if (s.startsWith(cssTokens.commentStart, i)) {
        const end = s.indexOf(cssTokens.commentEnd, i + 2);
        const j = end === -1 ? L : end + 2;
        this.add("COMMENT", s.slice(i, j), i, j, "cp-token-comment");
        i = j;
        continue;
      }

      // 2. Block Open
      if (s[i] === cssTokens.braceStart) {
        this.add("BLOCK_OPEN", cssTokens.braceStart, i, i + 1);
        i++;
        continue;
      }

      // 3. Block Close
      if (s[i] === cssTokens.braceEnd) {
        this.add("BLOCK_CLOSE", cssTokens.braceEnd, i, i + 1);
        i++;
        continue;
      }

      i++;
    }

    return this.tokens;
  }
}
