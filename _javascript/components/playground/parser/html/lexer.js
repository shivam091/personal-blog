import { BaseLexer } from "./../base-lexer";
import { htmlTokens } from "./constants";
import { JsLexer } from "./../js/lexer";
import { CssLexer } from "./../css/lexer";

function isNameStart(ch) {
  return /[A-Za-z]/.test(ch);
}
function isNameChar(ch) {
  return /[A-Za-z0-9\-\:_]/.test(ch); // include hyphen, colon (namespaces), underscore
}

export class HtmlLexer extends BaseLexer {
  run() {
    const s = this.input;

    while (!this.eof()) {
      const start = this.pos;
      const ch = this.peekChar();

      // 1. Comment
      if (s.startsWith(htmlTokens.commentStart, this.pos)) {
        const end = s.indexOf(htmlTokens.commentEnd, this.pos + htmlTokens.commentStart.length);
        let j = this.length;
        if (end !== -1) j = end + htmlTokens.commentEnd.length;
        else this.lexerError("Unclosed HTML comment: Expected '-->'", start, this.length);

        this.add("COMMENT", s.slice(start, j), start, j, "cp-token-comment");
        this.advancePosition(j - start);
        continue;
      }

      // 2. Tag open/close
      if (ch === "<") {
        // If it's a closing tag
        if (this.peekChar(1) === "/") {
          // scan name
          let j = this.pos + 2;
          while (j < this.length && isNameChar(s[j])) j++;
          // skip whitespace
          while (j < this.length && /\s/.test(s[j])) j++;
          if (s[j] === ">") j++;
          else {
            // find next '>' or end; be conservative
            const nextGt = s.indexOf(">", j);
            if (nextGt !== -1) j = nextGt + 1;
            else j = this.length;
            // don't throw lexerError for minor malformations — parser will report
          }
          const value = s.slice(start, j);
          this.add("TAG_CLOSE", value, start, j, "cp-token-tag");
          this.advancePosition(j - start);
          continue;
        }

        // Opening tag or declaration (doctype)
        // Handle <!DOCTYPE ...> or <?xml ...>
        if (this.peekChar(1) === "!" || this.peekChar(1) === "?") {
          // treat as TEXT up to next '>'
          const nextGt = s.indexOf(">", this.pos + 2);
          const j = nextGt !== -1 ? nextGt + 1 : this.length;
          this.add("TEXT", s.slice(start, j), start, j);
          this.advancePosition(j - start);
          continue;
        }

        // Normal opening tag: require a name start after '<'
        if (isNameStart(this.peekChar(1))) {
          let j = this.pos + 1;
          // read tag name
          while (j < this.length && isNameChar(s[j])) j++;
          // allow attributes — need to scan but not tokenize them fully.
          // We must handle quoted attribute values so '>' inside quotes doesn't end the tag.
          while (j < this.length) {
            const c = s[j];
            if (c === ">") {
              j++;
              break;
            }
            if (c === "'" || c === '"') {
              const quote = c;
              j++;
              while (j < this.length) {
                if (s[j] === "\\" && j + 1 < this.length) {
                  // skip escaped char
                  j += 2;
                  continue;
                }
                if (s[j] === quote) {
                  j++;
                  break;
                }
                j++;
              }
              continue;
            }
            // handle comments inside tag (unlikely but just in case)
            if (s.startsWith("<!--", j)) {
              const endc = s.indexOf("-->", j + 4);
              if (endc === -1) {
                j = this.length;
                break;
              } else {
                j = endc + 3;
                continue;
              }
            }
            j++;
          }

          const tagValue = s.slice(start, j);
          // extract tag name
          const m = tagValue.match(/^<\s*([A-Za-z0-9\-\:_]+)/);
          const tagName = m ? m[1].toLowerCase() : null;

          this.add("TAG_OPEN", tagValue, start, j, "cp-token-tag");
          this.advancePosition(j - start);

          // If it's a raw-text element (<script> or <style>), push inner content as a single token
          if (tagName === "script" || tagName === "style") {
            // if self-closing or open tag ended with '/>' then there's no raw region
            if (!/\/>$/.test(tagValue)) {
              // find the closing tag case-insensitively
              const closeTag = `</${tagName}>`;
              const idx = s.toLowerCase().indexOf(closeTag, this.pos);
              if (idx === -1) {
                // Take the rest as raw content and mark unclosed
                const rawStart = this.pos;
                const rawValue = s.slice(rawStart, this.length);
                // Delegate to proper lexer to tokenize for folding within rawValue
                if (tagName === "script") {
                  const jsLex = new JsLexer(rawValue, { offset: rawStart });
                  const innerTokens = jsLex.run();
                  // add raw as a single token for HTML but keep folding tokens for inner parse via grammar later.
                  this.add("RAW_SCRIPT", rawValue, rawStart, this.length, "cp-token-raw-script");
                } else {
                  const cssLex = new CssLexer(rawValue, { offset: rawStart });
                  const innerTokens = cssLex.run();
                  this.add("RAW_STYLE", rawValue, rawStart, this.length, "cp-token-raw-style");
                }
                this.advancePosition(this.length - rawStart);
                // No closing tag consumed here; Document parser will report unclosed
              } else {
                const rawStart = this.pos;
                const rawEnd = idx;
                const rawValue = s.slice(rawStart, rawEnd);
                // Delegate to proper lexer (for folding correctness) — store raw as token
                if (tagName === "script") {
                  // Optionally we could inline sub-tokens; for folding it's sufficient to mark RAW_SCRIPT
                  this.add("RAW_SCRIPT", rawValue, rawStart, rawEnd, "cp-token-raw-script");
                } else {
                  this.add("RAW_STYLE", rawValue, rawStart, rawEnd, "cp-token-raw-style");
                }
                // advance to before closing tag; do not consume closing tag here
                this.advancePosition(rawEnd - rawStart);
              }
            }
          }

          continue;
        }

        // otherwise fallthrough: treat as TEXT
      }

      // 3. Whitespace
      if (/\s/.test(ch)) {
        let tokenType = "TEXT";
        let tokenClass = undefined;
        if (ch === " ") {
          tokenType = "WHITESPACE"; tokenClass = "editor-token-space";
        } else if (ch === "\t") {
          tokenType = "TAB"; tokenClass = "editor-token-tab";
        } else if (ch === "\n" || ch === "\r") {
          tokenType = "NEWLINE";
        }
        this.add(tokenType, ch, start, start + 1, tokenClass);
        this.advancePosition(1);
        continue;
      }

      // 4. Anything else (text content or stray chars)
      this.add("TEXT", ch, start, start + 1);
      this.advancePosition(1);
    }

    return this.tokens;
  }
}
