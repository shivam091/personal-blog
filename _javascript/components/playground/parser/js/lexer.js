import { BaseLexer } from "../base-lexer";
import { jsTokens } from "./constants";

export class JsLexer extends BaseLexer {
  run() {
    const s = this.input;

    while (!this.eof()) {
      const char = this.peekChar(); // Peek at the current character
      const start = this.pos; // Capture start position

      // 1. Multi-line Comment
      if (s.startsWith(jsTokens.commentStart, this.pos)) {
        const end = s.indexOf(jsTokens.commentEnd, this.pos + 2);
        let j = this.length;

        if (end === -1) {
          // Unclosed comment check.
          this.lexerError("Unclosed JavaScript comment: Expected '*/'", start, this.length);
        } else {
          // Closed comment
          j = end + 2;
        }

        this.add("COMMENT", s.slice(start, j), start, j, "cp-token-comment");
        this.advancePosition(j - start);
        continue;
      }

      // 2. Single-line Comment
      if (s.startsWith(jsTokens.singleLineComment, this.pos)) {
        let j = this.pos + 2;
        // Scan to the end of the line ('\n') or EOF
        while (j < this.length && s[j] !== "\n") j++;
        // Note: The parser handles checking if this single-line token spans multiple lines
        this.add("SINGLE_COMMENT", s.slice(start, j), start, j, "cp-token-comment");
        this.advancePosition(j - start);
        continue;
      }

      // 3. Block Open
      if (char === jsTokens.braceStart) {
        this.add("BLOCK_OPEN", jsTokens.braceStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 4. Block Close
      if (char === jsTokens.braceEnd) {
        this.add("BLOCK_CLOSE", jsTokens.braceEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 5. Parenthesis Open (()
      if (char === jsTokens.parenStart) {
        this.add("PAREN_OPEN", jsTokens.parenStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 6. Parenthesis Close ())
      if (char === jsTokens.parenEnd) {
        this.add("PAREN_CLOSE", jsTokens.parenEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 7. Bracket Open ([)
      if (char === jsTokens.bracketStart) {
        this.add("BRACKET_OPEN", jsTokens.bracketStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 8. Bracket Close (])
      if (char === jsTokens.bracketEnd) {
        this.add("BRACKET_CLOSE", jsTokens.bracketEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 9. Whitespace (explicitly handle standard space and other non-newline whitespace)
      if (/\s/.test(char) && char !== "\n" && char !== "\r" && char !== "\t") {
        this.add("WHITESPACE", char, start, start + 1, "editor-token-space");
        this.advancePosition(1);
        continue;
      }

      // 10. Tab
      if (char === "\t") {
        this.add("TAB", char, start, start + 1, "editor-token-tab");
        this.advancePosition(1);
        continue;
      }

      // 11. Newline
      if (char === "\n" || char === "\r") {
        this.add("NEWLINE", char, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // 12. Ignore all other characters (including newlines and other content)
      this.add("TEXT", char, start, start + 1);
      this.advancePosition(1);
    }

    return this.tokens;
  }
}
