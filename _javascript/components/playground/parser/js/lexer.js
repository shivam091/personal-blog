import { BaseLexer } from "../base-lexer";
import { jsTokens } from "./constants";

export class JsLexer extends BaseLexer {
  run() {
    const s = this.input;
    const L = s.length;
    let i = 0;

    while (i < L) {
      const char = s[i]; // Peek at the current character

      // 1. Multi-line Comment
      if (s.startsWith(jsTokens.commentStart, i)) {
        const end = s.indexOf(jsTokens.commentEnd, i + 2);
        const j = end === -1 ? L : end + 2;
        this.add("COMMENT", s.slice(i, j), i, j, "cp-token-comment");
        i = j;
        continue;
      }

      // 2. Single-line Comment
      if (s.startsWith(jsTokens.singleLineComment, i)) {
        let j = i + 2;
        // Scan to the end of the line ('\n') or EOF
        while (j < L && s[j] !== "\n") j++;
        // Note: The parser handles checking if this single-line token spans multiple lines
        this.add("SINGLE_COMMENT", s.slice(i, j), i, j, "cp-token-comment");
        i = j;
        continue;
      }

      // 3. Block Open
      if (char === jsTokens.braceStart) {
        this.add("BLOCK_OPEN", jsTokens.braceStart, i, i + 1);
        i++;
        continue;
      }

      // 4. Block Close
      if (char === jsTokens.braceEnd) {
        this.add("BLOCK_CLOSE", jsTokens.braceEnd, i, i + 1);
        i++;
        continue;
      }

      // 5. Whitespace
      if (char === " ") {
        this.add("WHITESPACE", char, i, i + 1, "editor-token-space");
        i++;
        continue;
      }

      // 6. Tab
      if (char === "\t") {
        this.add("TAB", char, i, i + 1, "editor-token-tab");
        i++;
        continue;
      }

      // 7. Ignore all other characters (including newlines and other content)
      i++;
    }

    return this.tokens;
  }
}
