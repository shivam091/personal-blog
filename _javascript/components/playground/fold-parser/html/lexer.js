import { BaseLexer } from "./../base-lexer";
import { htmlTokens } from "./constants";

export class HtmlLexer extends BaseLexer {
  run() {
    const s = this.input;
    const L = s.length;
    let i = 0;

    while (i < L) {
      // 1. Comment
      if (s.startsWith(htmlTokens.commentStart, i)) {
        // Find '-->' starting after the initial '<!--' (i + 4)
        const end = s.indexOf("-->", i + 4);
        const j = end === -1 ? L : end + 3;
        this.add("COMMENT", s.slice(i, j), i, j, "cp-token-comment");
        i = j;
        continue;
      }

      // 2. Opening Tag
      if (s[i] === htmlTokens.tagStart) {
        // Check if it's an end tag: '</'
        if (s[i + 1] === "/") {
          let j = i + 2; // Start looking after '</'
          while (j < L && s[j] !== htmlTokens.tagEnd) j++;

          const tagValue = s.slice(i, j + 1);
          this.add("TAG_CLOSE", tagValue, i, j + 1, "cp-token-tag");
          i = j + 1;
          continue;
        }

        // Check for a regular opening tag: '<' followed by a letter/name
        if (/[A-Za-z]/.test(s[i + 1])) {
          let j = i + 1;
          while (j < L && s[j] !== htmlTokens.tagEnd) j++;

          const tagValue = s.slice(i, j + 1);
          this.add("TAG_OPEN", tagValue, i, j + 1, "cp-token-tag");
          i = j + 1;
          continue;
        }
      }

      // 3. Ignore everything else
      i++;
    }

    return this.tokens;
  }
}
