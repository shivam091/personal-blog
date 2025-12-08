import { BaseLexer } from "./../base-lexer";
import { cssTokens } from "./constants";

export class CssLexer extends BaseLexer {
  run() {
    const s = this.input;

    while (!this.eof()) {
      const start = this.pos;
      const ch = this.peekChar();

      // Comment
      if (s.startsWith(cssTokens.commentStart, this.pos)) {
        const end = s.indexOf(cssTokens.commentEnd, this.pos + 2);
        let j = this.length;
        if (end !== -1) j = end + cssTokens.commentEnd.length;
        else this.lexerError("Unclosed CSS comment: Expected '*/'", start, this.length);

        this.add("COMMENT", s.slice(start, j), start, j, "cp-token-comment");
        this.advancePosition(j - start);
        continue;
      }

      // Strings (single/double)
      if (ch === '"' || ch === "'") {
        const quote = ch;
        let j = this.pos + 1;
        while (j < this.length) {
          if (s[j] === "\\" && j + 1 < this.length) {
            j += 2;
            continue;
          }
          if (s[j] === quote) { j++; break; }
          j++;
        }
        const val = s.slice(start, j);
        this.add("STRING", val, start, j, "cp-token-string");
        this.advancePosition(j - start);
        continue;
      }

      // Parentheses (for functions)
      if (ch === cssTokens.parenStart) {
        this.add("PAREN_OPEN", cssTokens.parenStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }
      if (ch === cssTokens.parenEnd) {
        this.add("PAREN_CLOSE", cssTokens.parenEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // Braces
      if (ch === cssTokens.braceStart) {
        this.add("BLOCK_OPEN", cssTokens.braceStart, start, start + 1);
        this.advancePosition(1);
        continue;
      }
      if (ch === cssTokens.braceEnd) {
        this.add("BLOCK_CLOSE", cssTokens.braceEnd, start, start + 1);
        this.advancePosition(1);
        continue;
      }

      // Whitespace
      if (/\s/.test(ch)) {
        let tokenType = "TEXT";
        let tokenClass = undefined;
        if (ch === " ") { tokenType = "WHITESPACE"; tokenClass = "editor-token-space"; }
        else if (ch === "\t") { tokenType = "TAB"; tokenClass = "editor-token-tab"; }
        else if (ch === "\n" || ch === "\r") { tokenType = "NEWLINE"; }
        this.add(tokenType, ch, start, start + 1, tokenClass);
        this.advancePosition(1);
        continue;
      }

      // Anything else: selectors, properties, numbers, semicolons, commas
      this.add("TEXT", ch, start, start + 1);
      this.advancePosition(1);
    }

    return this.tokens;
  }
}
