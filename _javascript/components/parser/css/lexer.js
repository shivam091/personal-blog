import { BaseLexer } from '../base-lexer';
import { cssTokens } from './constants';

const isIdentChar = ch => /[A-Za-z0-9_\-]/.test(ch);

export class CssLexer extends BaseLexer {
  run() {
    const s = this.input;
    let i = 0,
      L = s.length;

    while (i < L) {
      const start = i;
      const ch = s[i];

      // --- 1. Whitespace (WS) ---
      if (/\s/.test(ch)) {
        let j = i;
        while (j < L && /\s/.test(s[j])) j++;
        this.add('WS', s.slice(i, j), i, j, '');
        i = j;
        continue;
      }

      // --- 2. At-Rule/Keyword (@rule) ---
      if (ch === '@') {
        let j = i + 1;
        while (j < L && /[A-Za-z0-9_\-]/.test(s[j])) j++;
        const atRule = s.slice(i, j);
        if (cssTokens.atRules.has(atRule)) {
            this.add('AT_RULE', atRule, i, j, "cp-token-keyword");
            i = j;
            continue;
        }
      }

      // --- 2. Multi-line Comment (/* ... */) ---
      if (s.startsWith('/*', i)) {
        const end = s.indexOf('*/', i + 2);
        const j = end === -1 ? L : end + 2;
        this.add('COMMENT', s.slice(i, j), i, j, "cp-token-comment");
        i = j;
        continue;
      }

      // --- 3. Single-line Comment (//) ---
      if (s.startsWith('//', i)) {
        let j = s.indexOf('\n', i + 2);
        if (j === -1) j = L;
        this.add('COMMENT', s.slice(i, j), i, j, "cp-token-comment");
        i = j;
        continue;
      }

      // --- 4. Single-character Symbols ({, }, :, ;, ,) ---
      if (ch === '{' || ch === '}' || ch === ':' || ch === ';' || ch === ',') {
        this.add('SYMBOL', ch, i, i + 1, 'tok-symbol');
        i++;
        continue;
      }

      // --- 5. Quoted String ("..." or '...') ---
      if (ch === '"' || ch === "'") {
        const q = ch;
        let j = i + 1;
        while (j < L && s[j] !== q) {
          if (s[j] === "\\") j += 2;
          else j++;
        }
        const end = Math.min(L, j + 1);
        this.add('STRING', s.slice(i, end), i, end, "cp-token-string");
        i = end;
        continue;
      }

      // --- 6. Hash/Hex Value (#RRGGBB, #id, etc.) ---
      if (ch === '#') {
        let j = i + 1;
        // Check for a full hex color first (requires at least 3 hex characters)
        let isHexColor = true;
        let k = i + 1;
        while (k < L && /[0-9A-Fa-f]/.test(s[k])) k++;

        // If it looks like a hex color (e.g., #123, #abc)
        if (k - (i + 1) >= 3 && (k - (i + 1) <= 8) && (k === L || !isIdentChar(s[k]) ) ) {
          j = k;
        } else {
          isHexColor = false;
          // If it's not a clear hex color, assume it's an ID selector
          // ID selectors can contain numbers, letters, underscores, and hyphens.
          j = i + 1;
          while (j < L && isIdentChar(s[j])) j++;
        }

        const value = s.slice(i, j);
        const type = isHexColor ? "COLOR" : "ID_SELECTOR";
        const spanClass = isHexColor ? "cp-token-hex-color" : "cp-token-selector";

        this.add(type, value, i, j, spanClass);
        i = j;
        continue;
    }

      // --- 7. Number/Dimension (10, 1.5, 12px, 50%) ---
      if (/[0-9]/.test(ch)) {
        let j = i;
        while (j < L && /[0-9.]/.test(s[j])) j++;
        let k = j;
        while (k < L && /[A-Za-z%]/.test(s[k])) k++;
        this.add('NUMBER', s.slice(i, k), i, k, 'cp-token-number');
        i = k;
        continue;
      }

      // --- 7. CSS Variable (--variable-name) ---
      if (s.startsWith('--', i)) {
        let j = i + 2; // Start after the '--'
        // Variables can contain any ident characters
        while (j < L && isIdentChar(s[j])) j++;
        const value = s.slice(i, j);

        // A variable must be longer than just '--'
        if (j > i + 2) {
            this.add('VARIABLE', value, i, j, 'cp-token-variable');
            i = j;
            continue;
        }
        // If it was just '--', fall through to be handled as symbols/unknown
      }

      // --- 8. Identifier (Color Keyword, Property, Value, Selector Part) ---
      if (isIdentChar(ch) || ch === '.' || ch === '*' || ch === '[') {
        let j = i;
        let className = 'tok-ident';
        let type = 'IDENT';

        // 8a. Scan ONLY the identifier part (e.g., 'rgba', 'border-color')
        while (j < L && isIdentChar(s[j])) j++;
        const identEnd = j;
        const identValue = s.slice(i, identEnd); // e.g., "rgba"

        // 8b. Check for Function Name (rgba( -> tokenize 'rgba' and continue)
        if (cssTokens.cssFunctions.has(identValue) && s[identEnd] === '(') {
            // Tokenize 'rgba' and stop. The parser handles the '(' next.
             this.add('FUNCTION_NAME', identValue, i, identEnd, 'cp-token-function');
             i = identEnd;
             continue;
        }

        // If not a function, continue scanning for the full token block (selectors, etc.)
        let k = identEnd;
        while (k < L && (isIdentChar(s[k]) || s[k] === '.' || s[k] === '#' || s[k] === '*' || s[k] === '[' || s[k] === ']' || s[k] === ')' || s[k] === '-')) {
            k++;
        }

        const value = s.slice(i, k); // Full selector/identifier block
        j = k;

        // 8c. Check for known keywords against the primary identifier part (identValue)
        if (cssTokens.mediaFeatures.has(identValue)) {
          type = "MEDIA_FEATURE";
          className = "cp-token-media-feature";
        } else if (cssTokens.colorKeywords.has(identValue)) {
            type = "COLOR";
            className = "cp-token-color";
        } else if (cssTokens.properties.has(identValue)) {
          type = "PROPERTY";
          className = "cp-token-property";
        } else if (cssTokens.logicalProperties.has(identValue)) {
          type = "PROPERTY";
          className = "cp-token-logical-property";
        } else if (cssTokens.values.has(identValue)) {
          type = "VALUE_KEYWORD";
          className = "cp-token-value";
        }
        // Else it remains IDENT with tok-ident class

        this.add(type, value, i, j, className);
        i = j;
        continue;
      }

      // --- 9. Fallback (Unknown Character) ---
      this.add('UNKNOWN', ch, i, i + 1, 'tok-unknown');
      i++;
    }
    return this.tokens;
  }
}