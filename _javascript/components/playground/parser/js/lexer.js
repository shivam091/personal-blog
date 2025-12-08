import { BaseLexer } from "./../base-lexer";
import { jsTokens } from "./constants";

// Heuristic function to detect whether a '/' at pos can start a regex.
// This is a conservative heuristic: if previous non-space token is one that can end an expression,
// we assume division; otherwise regex. For folding, it's safer to detect regex only in likely positions.
function likelyRegexStart(prevChar) {
  // if previous char is one of: ) ] } identifier/number/string -> probably division
  if (!prevChar) return true;
  if (/\s/.test(prevChar)) return true;
  if (/[)\]\}0-9"'`]/.test(prevChar)) return false;
  // tokens that introduce expressions: = ( , : ? [ { ; return => start regex
  if (/[=([{:;,!+\-*/%<>?~]/.test(prevChar)) return true;
  return true;
}

export class JsLexer extends BaseLexer {
  run() {
    const s = this.input;
    while (!this.eof()) {
      const start = this.pos;
      const ch = this.peekChar();

      // Multi-line comment
      if (s.startsWith(jsTokens.commentStart, this.pos)) {
        const end = s.indexOf(jsTokens.commentEnd, this.pos + 2);
        let j = this.length;
        if (end !== -1) j = end + jsTokens.commentEnd.length;
        else this.lexerError("Unclosed JavaScript comment: Expected '*/'", start, this.length);

        this.add("COMMENT", s.slice(start, j), start, j, "cp-token-comment");
        this.advancePosition(j - start);
        continue;
      }

      // Single-line comment
      if (s.startsWith(jsTokens.singleLineComment, this.pos)) {
        let j = this.pos + 2;
        while (j < this.length && s[j] !== "\n") j++;
        this.add("SINGLE_COMMENT", s.slice(start, j), start, j, "cp-token-comment");
        this.advancePosition(j - start);
        continue;
      }

      // Strings: single or double
      if (ch === '"' || ch === "'") {
        const quote = ch;
        let j = this.pos + 1;
        while (j < this.length) {
          if (s[j] === "\\" && j + 1 < this.length) { j += 2; continue; }
          if (s[j] === quote) { j++; break; }
          j++;
        }
        const val = s.slice(start, j);
        this.add("STRING", val, start, j, "cp-token-string");
        this.advancePosition(j - start);
        continue;
      }

      // Template literals `...` (handle ${ ... } nested)
      if (ch === "`") {
        let j = this.pos + 1;
        while (j < this.length) {
          if (s[j] === "\\" && j + 1 < this.length) { j += 2; continue; }
          if (s[j] === "$" && s[j+1] === "{") {
            // add part up to ${ as a template chunk, then consume ${ and parse interpolation
            j += 2; // skip ${
            // Now we need to find matching } respecting nested braces; we'll capture template as a whole TEXT token
            let depth = 1;
            while (j < this.length && depth > 0) {
              if (s[j] === "'" || s[j] === '"' || s[j] === "`") {
                // skip inner strings naïvely to avoid false brace counts
                const q = s[j];
                j++;
                while (j < this.length) {
                  if (s[j] === "\\" && j + 1 < this.length) { j += 2; continue; }
                  if (s[j] === q) { j++; break; }
                  j++;
                }
                continue;
              }
              if (s[j] === "{") { depth++; j++; continue; }
              if (s[j] === "}") { depth--; j++; continue; }
              if (s[j] === "\\" && j + 1 < this.length) { j += 2; continue; }
              j++;
            }
            continue; // continue scanning template until closing backtick
          }
          if (s[j] === "`") { j++; break; }
          j++;
        }
        const val = s.slice(start, j);
        this.add("TEMPLATE", val, start, j, "cp-token-template");
        this.advancePosition(j - start);
        continue;
      }

      // Braces, parentheses, brackets
      if (ch === jsTokens.braceStart) { this.add("BLOCK_OPEN", ch, start, start + 1); this.advancePosition(1); continue; }
      if (ch === jsTokens.braceEnd) { this.add("BLOCK_CLOSE", ch, start, start + 1); this.advancePosition(1); continue; }
      if (ch === jsTokens.parenStart) { this.add("PAREN_OPEN", ch, start, start + 1); this.advancePosition(1); continue; }
      if (ch === jsTokens.parenEnd) { this.add("PAREN_CLOSE", ch, start, start + 1); this.advancePosition(1); continue; }
      if (ch === jsTokens.bracketStart) { this.add("BRACKET_OPEN", ch, start, start + 1); this.advancePosition(1); continue; }
      if (ch === jsTokens.bracketEnd) { this.add("BRACKET_CLOSE", ch, start, start + 1); this.advancePosition(1); continue; }

      // Regex literal heuristic: starts with '/' not followed by '/' or '*'
      if (ch === "/" && !s.startsWith("//", this.pos) && !s.startsWith("/*", this.pos)) {
        // Inspect previous significant char to heuristically decide
        const prev = this.pos > 0 ? s[this.pos - 1] : null;
        if (likelyRegexStart(prev)) {
          // consume until next unescaped '/' and optional flags
          let j = this.pos + 1;
          let inClass = false;
          while (j < this.length) {
            if (s[j] === "\\" && j + 1 < this.length) { j += 2; continue; }
            if (s[j] === "[" ) { inClass = true; j++; continue; }
            if (s[j] === "]" ) { inClass = false; j++; continue; }
            if (s[j] === "/" && !inClass) { j++; break; }
            j++;
          }
          // flags
          while (j < this.length && /[a-zA-Z]/.test(s[j])) j++;
          const val = s.slice(start, j);
          this.add("REGEX", val, start, j, "cp-token-regex");
          this.advancePosition(j - start);
          continue;
        }
      }

      // JSX start heuristic: if '<' followed by letter or '/' and not an operator context, treat as JSX
      if (ch === "<") {
        const nextCh = this.peekChar(1);
        if (/[A-Za-z\/]/.test(nextCh)) {
          // parse a simple JSX element until matching closing tag; handle self-closing
          let j = this.pos;
          let depth = 0;
          while (j < this.length) {
            if (s[j] === "<" && s[j+1] !== "!" && s[j+1] !== "?") {
              // simple open or close
              if (s[j+1] === "/") depth--;
              else depth++;
              j++;
              // advance until '>' taking quotes into account
              while (j < this.length && s[j] !== ">") {
                if (s[j] === '"' || s[j] === "'") {
                  const q = s[j]; j++;
                  while (j < this.length) {
                    if (s[j] === "\\" && j + 1 < this.length) { j += 2; continue; }
                    if (s[j] === q) { j++; break; }
                    j++;
                  }
                  continue;
                }
                j++;
              }
              if (s[j] === ">") j++;
              continue;
            }
            j++;
            // end condition: if depth <= 0 and we've passed first element, break
            if (depth <= 0 && j > this.pos) break;
          }
          const val = s.slice(start, j);
          this.add("JSX", val, start, j, "cp-token-jsx");
          this.advancePosition(j - start);
          continue;
        }
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

      // Anything else: operators, identifiers, numbers etc.
      this.add("TEXT", ch, start, start + 1);
      this.advancePosition(1);
    }

    return this.tokens;
  }
}
