import { BaseLexer } from "./../base-lexer";
import { jsTokens } from "./constants";

/**
 * Checks if a character is a valid starting character for a JavaScript identifier.
 * @param {string} ch - The character to check.
 * @returns {boolean}
 */
const isIdentStart = ch => /[A-Za-z_$]/.test(ch);

/**
 * Checks if a character is a valid part of a JavaScript identifier (after the first character).
 * @param {string} ch - The character to check.
 * @returns {boolean}
 */
const isIdentPart = ch => /[A-Za-z0-9_$]/.test(ch);

/**
 * @class JsLexer
 * @extends BaseLexer
 * @description A lexer for JavaScript code that tokenizes keywords, identifiers,
 * strings, numbers, comments, and punctuation.
 */
export class JsLexer extends BaseLexer {
  /**
   * Runs the lexing process over the input string and generates a list of tokens.
   * @public
   * @returns {Array<Token>} The list of generated tokens.
   */
  run() {
    const s = this.input;
    let i = 0;
    const L = s.length;

    while (i < L) {
      const start = i;
      const ch = s[i];

      // --- 1. Whitespace ---
      if (/\s/.test(ch)) {
        let j = i;
        while (j < L && /\s/.test(s[j])) j++;
        this.add('WS', s.slice(i, j), i, j, '');
        i = j;
        continue;
      }

      // --- 2. Comments (Single-line: //) ---
      if (s.startsWith("//", i)) {
        let j = s.indexOf("\n", i + 2);
        if (j === -1) j = L;
        this.add("COMMENT", s.slice(i, j), i, j, "cp-token-comment");
        i = j;
        continue;
      }

      // --- 3. Comments (Multi-line: /* */) ---
      if (s.startsWith('/*', i)) {
        let j = s.indexOf('*/', i + 2);
        if (j === -1) j = L;
        else j += 2; // Include the closing '*/'
        this.add('COMMENT', s.slice(i, j), i, j, 'cp-token-comment');
        i = j;
        continue;
      }

      // --- 4. Strings (Single, Double, Template) ---
      if (ch === '"' || ch === "'" || ch === '`') {
        const q = ch;
        let j = i + 1;
        while (j < L) {
          if (s[j] === '\\') j += 2; // Skip escaped characters (e.g., \n, \", \\)
          else if (s[j] === q) {
            j++;
            break;
          } else j++;
        }
        this.add('STRING', s.slice(i, j), i, j, "cp-token-string");
        i = j;
        continue;
      }

      // --- 5. Numbers ---
      if (/[0-9]/.test(ch)) {
        let j = i;
        while (j < L && /[0-9.]/.test(s[j])) j++; // Simple match for digits and dot (handles decimals but not full JS spec)
        this.add('NUMBER', s.slice(i, j), i, j, 'cp-token-number');
        i = j;
        continue;
      }

      // --- 6. Identifiers and Keywords ---
      if (isIdentStart(ch)) {
        let j = i + 1;
        while (j < L && isIdentPart(s[j])) j++;
        const v = s.slice(i, j);
        let type = 'IDENT';
        let cssClass = 'tok-ident';

        // Check against new token categories
        if (jsTokens.keywords.has(v)) {
          type = 'KEYWORD';
          cssClass = 'cp-token-keyword';
        } else if (jsTokens.literals.has(v)) {
          type = 'LITERAL';
          cssClass = 'tok-literal';
        } else if (jsTokens.builtInVariables.has(v)) {
          type = 'BUILT_IN_VAR';
          // Note: 'this' is also a keyword in the original set, so check 'keywords' first.
          // If 'this' is removed from keywords, this block correctly identifies it.
          // Since it's in both in the *provided* code, let's assume KEYWORD takes precedence
          // unless you want a different highlight. We'll stick to 'tok-ident-special' for now.
          cssClass = 'tok-ident-special';
        } else if (jsTokens.builtInGlobals.has(v) || jsTokens.errorTypes.has(v)) {
          type = 'BUILT_IN_GLOBAL';
          cssClass = 'tok-builtin-type';
        }
        // If none of the above, it remains IDENT / tok-ident

        this.add(type, v, i, j, cssClass);
        i = j;
        continue;
      }

      // --- 7. Punctuation (Multi-char and Single-char) ---
      const two = s.slice(i, i + 2);
      const three = s.slice(i, i + 3);

      // Multi-char punctuators (ordered by length descending)
      const multi = new Set([
        '===', '!==', // 3-char
        '==', '!=', '=>', '&&', '||', '<=', '>=', '++', '--', '+=', '-=', '*=', '/=', '%=' // 2-char
      ]);

      if (multi.has(three)) {
        this.add('PUNC', three, i, i + 3, 'tok-punc');
        i += 3;
        continue;
      }
      if (multi.has(two)) {
        this.add('PUNC', two, i, i + 2, 'tok-punc');
        i += 2;
        continue;
      }

      // Single-char punctuators
      const single = '{}[]().,;:+-*/%<>?=~!&|^';
      if (single.includes(ch)) {
        this.add('PUNC', ch, i, i + 1, 'tok-punc');
        i++;
        continue;
      }

      // --- 8. Unknown Character ---
      this.add('UNKNOWN', ch, i, i + 1, 'tok-unknown');
      i++;
    }

    return this.tokens;
  }
}