import { BaseLexer } from "../base-lexer";
import { htmlTokens } from "./constants";

function isDataAttr(name) {
  return name.startsWith("data-");
}

function isAriaAttr(name) {
  return name.startsWith("aria-");
}

export class HtmlLexer extends BaseLexer {
  run() {
    const s = this.input;
    const L = s.length;
    let i = 0;

    // Helper to find the last non-WS token
    const findLastNonWSToken = () => {
      for (let k = this.tokens.length - 1; k >= 0; k--) {
        if (this.tokens[k].type !== 'WS') return this.tokens[k];
      }
      return null;
    };

    while (i < L) {
      const prevToken = findLastNonWSToken();

      // --- 1. Comment ---
      if (s.startsWith('<!--', i)) {
        const end = s.indexOf('-->', i + 4);
        const j = end === -1 ? L : end + 3;
        this.add('COMMENT', s.slice(i, j), i, j, "cp-token-comment");
        i = j;
        continue;
      }

      // --- 2. CDATA SECTION (e.g., <![CDATA[ content ]]> ) ---
      if (s.startsWith('<![CDATA[', i)) {
        const end = s.indexOf(']]>', i + 9);
        const j = end === -1 ? L : end + 3; // Include the closing ']]>'
        this.add('CDATA', s.slice(i, j), i, j, "cp-token-cdata");
        i = j;
        continue;
      }

      // --- 3. DOCTYPE/DTD DECLARATIONS (Covers DOCTYPE, ENTITY, ELEMENT, etc.)
      if (s.startsWith('<!', i)) {
        // Look for the closing '>'
        const end = s.indexOf('>', i + 2);
        const j = end === -1 ? L : end + 1; // Include the closing '>'

        const content = s.slice(i, j);
        const isDOCTYPE = content.toLowerCase().startsWith('<!doctype');

        // Use a general token type for DTD/SGML declarations
        const tokenType = isDOCTYPE ? 'DOCTYPE' : 'DTD_DECL';
        const spanClass = isDOCTYPE ? 'cp-token-keyword' : 'cp-token-meta';

        this.add(tokenType, content, i, j, spanClass);
        i = j;
        continue;
      }

      // --- 4. Match Processing Instruction (e.g., XML <?xml...?>) ---
      if (s.startsWith('<?', i)) {
        const end = s.indexOf('?>', i + 2);
        const j = end === -1 ? L : end + 2; // Include the closing '?>'
        this.add('PI', s.slice(i, j), i, j, "cp-token-entity"); // PI for Processing Instruction
        i = j;
        continue;
      }

      // --- 5. SYMBOLS and Control Tokens ---
      if (s.startsWith('</', i)) {
        this.add('SYMBOL', '</', i, i+2, 'cp-token-tag-bracket');
        i += 2;
        continue;
      }

      if (s[i] === '<') {
        this.add('SYMBOL', '<', i, i+1, 'cp-token-tag-bracket');
        i++;
        continue;
      }

      if (s[i] === '>') {
        this.add('SYMBOL', '>', i, i+1, 'cp-token-tag-bracket');
        i++;
        continue;
      }

      if (s[i] === '=') {
        this.add('SYMBOL', '=', i, i+1, 'cp-token-eq');
        i++;
        continue;
      }

      // --- 6. Whitespace ---
      if (/\s/.test(s[i])) {
        let j = i;
        while (j < L && /\s/.test(s[j])) j++;
        this.add('WS', s.slice(i, j), i, j);
        i = j;
        continue;
      }

      // --- 7. Quoted String ---
      if (s[i] === '"' || s[i] === "'") {
        const q = s[i];
        let j = i + 1;
        while (j < L && s[j] !== q) {
          if (s[j] === "\\") j += 2;
          else j++;
        }
        const end = Math.min(L, j+1);
        this.add('STRING', s.slice(i, end), i, end, 'cp-token-string');
        i = end;
        continue;
      }

      // --- 8. HTML Entity (Tag/Attribute Name) ---
      if (s[i] === '&') {
        let j = i + 1;
        let isHex = false;

        // Check for numeric entity (e.g., &#32; or &#x20;)
        if (s[j] === '#') {
          j++;
          if (s[j] === 'x' || s[j] === 'X') {
            j++;
            isHex = true;
          }

          while (j < L && /[0-9A-Fa-f]/.test(s[j])) j++;
        } else {
          // Check for named entity (e.g., &amp;)
          while (j < L && /[A-Za-z0-9]/.test(s[j])) j++;
        }

        // The sequence must end with a semicolon
        if (j < L && s[j] === ';') {
          const entityText = s.slice(i + 1, j);

          // Basic validation for named or numeric/hex entities
          let isValid = false;
          if (entityText.startsWith('#')) { // Numeric/Hex
            isValid = true;
          } else { // Named
            isValid = htmlTokens.entities.has(entityText.toLowerCase());
          }

          if (isValid) {
            j++; // Consume the semicolon
            this.add('ENTITY', s.slice(i, j), i, j, 'cp-token-entity');
            i = j;
            continue;
          }
        }

        // If the sequence started with '&' but wasn't a valid entity,
        // it falls through to Section 6 (TEXT) to be treated as plain text.
      }

      // --- 9. IDENTIFIER (Tag/Attribute Name) ---
      if (/[A-Za-z0-9_:\-]/.test(s[i])) {
        let j = i;
        while (j < L && /[A-Za-z0-9_:\-]/.test(s[j])) j++;
        const ident = s.slice(i, j);
        const lower = ident.toLowerCase();

        let isTokenAdded = false;

        // 1. Tag Name: Immediately after '<' or '</'
        if (prevToken && (prevToken.value === '<' || prevToken.value === '</')) {
          const spanClass = htmlTokens.tags.has(lower) ? 'cp-token-tag' : 'tok-unknown';
          this.add('IDENT', ident, i, j, spanClass);
          isTokenAdded = true;
        // 2. Unquoted Attribute Value
        } else if (prevToken && prevToken.value === '=') {
            // Consume all characters allowed in unquoted values until whitespace or tag closer
          let valEnd = i;
          // Using the simplified, but generally robust, check for common unquoted value characters
          while (valEnd < L && /[A-Za-z0-9_:\-\.]/.test(s[valEnd])) {
            valEnd++;
          }
          const unquotedValue = s.slice(i, valEnd);

          if (unquotedValue.length > 0) {
            this.add('STRING', unquotedValue, i, valEnd, 'cp-token-string');
            i = valEnd;
            continue; // We found the unquoted value, advance and restart
          }
        // 3. Attribute Name: Must be inside an opening tag, and not after a TEXT token (which implies being outside a tag)
        // FIX: Tightened the attribute check to exclude being after a TEXT token.
        } else if (prevToken && prevToken.value !== '>' && prevToken.type !== 'TEXT') {
          const isKnownAttr = htmlTokens.attributes.has(lower) || isDataAttr(lower) || isAriaAttr(lower);
          const type = isKnownAttr ? 'IDENT' : 'UNKNOWN';
          const spanClass = isKnownAttr ? 'cp-token-attribute' : 'tok-unknown';
          this.add(type, ident, i, j, spanClass);
          isTokenAdded = true;
        }


        if (isTokenAdded) {
            i = j;
            continue; // Continue only if we successfully tokenized a tag or attribute
        }

        // If we reach here, it's an identifier outside a tag structure.
        // We let it fall through to Section 6 to be collected as a large TEXT chunk.
      }

      // --- 10. TEXT (Catches content and identifiers that fell through) ---
      let j = i;
      while (j < L && s[j] !== '<') {
          // This loop will now collect all characters (including words and punctuation)
          // until it hits a '<', correctly grouping the body text.
          j++;
      }

      // If the TEXT token is empty, we must advance i to avoid an infinite loop
      if (j === i) {
          // Fallback: If we couldn't match anything, skip one character
          this.add('UNKNOWN', s[i], i, i + 1, 'cp-token-unknown');
          i++;
      } else {
          this.add('TEXT', s.slice(i, j), i, j, 'cp-token-text');
          i = j;
      }
    }

    return this.tokens;
  }
}