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

    // NEW HELPER: Look ahead for a valid HTML tag name
    const peekForTagName = (start) => {
        let k = start;
        // Skip any whitespace immediately following the bracket
        while (k < L && /\s/.test(s[k])) k++;

        let j = k;
        while (j < L && /[A-Za-z0-9_:\-]/.test(s[j])) j++;

        const ident = s.slice(k, j);
        return htmlTokens.tags.has(ident.toLowerCase()) ? ident : null;
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
        const j = end === -1 ? L : end + 3;
        this.add('CDATA', s.slice(i, j), i, j, "cp-token-cdata");
        i = j;
        continue;
      }

      // --- 3. DOCTYPE/DTD DECLARATIONS ---
      if (s.startsWith('<!', i)) {
        const end = s.indexOf('>', i + 2);
        const j = end === -1 ? L : end + 1;
        const content = s.slice(i, j);
        const isDOCTYPE = content.toLowerCase().startsWith('<!doctype');
        const tokenType = isDOCTYPE ? 'DOCTYPE' : 'DTD_DECL';
        const spanClass = isDOCTYPE ? 'cp-token-keyword' : 'cp-token-meta';
        this.add(tokenType, content, i, j, spanClass);
        i = j;
        continue;
      }

      // --- 4. Match Processing Instruction (XML <?xml...?>) ---
      if (s.startsWith('<?', i)) {
        const end = s.indexOf('?>', i + 2);
        const j = end === -1 ? L : end + 2;
        this.add('PI', s.slice(i, j), i, j, "cp-token-entity");
        i = j;
        continue;
      }

      // --- 5. SYMBOLS and Control Tokens ---

      // Closing tag sequence '</'
      if (s.startsWith('</', i)) {
        const tagName = peekForTagName(i + 2);
        const tagCls = tagName ? 'cp-token-tag' : 'cp-token-tag-bracket';
        this.add('SYMBOL', '</', i, i + 2, tagCls);
        i += 2;
        continue;
      }

      // Opening tag sequence '<'
      if (s[i] === '<') {
        const tagName = peekForTagName(i + 1);
        const nextChar = s[i+1];

        let tagCls = 'cp-token-tag-bracket';

        if (tagName) {
             tagCls = 'cp-token-tag';
        } else if (nextChar === '!' || nextChar === '?') {
             tagCls = 'cp-token-meta';
        }

        this.add('SYMBOL', '<', i, i + 1, tagCls);
        i++;
        continue;
      }

      // Assignment symbol '='
      if (s[i] === '=') {
        this.add('SYMBOL', '=', i, i + 1, 'cp-token-eq');
        i++;
        continue;
      }

      // Self-closing slash (e.g., <img ... />)
      if (s[i] === '/') {
        if (s[i+1] === '>' && prevToken && prevToken.value !== '>') {
            this.add('SYMBOL', '/', i, i + 1, 'cp-token-tag');
            i++;
            continue;
        }
      }

      // Closing bracket '>'
      if (s[i] === '>') {
        let isClosingTag = false;
        if (prevToken) {
            if (['IDENT', 'STRING'].includes(prevToken.type) || ['/', '='].includes(prevToken.value)) {
                 isClosingTag = true;
            }
        }

        if (isClosingTag) {
            this.add('SYMBOL', '>', i, i + 1, 'cp-token-tag');
            i++;
            continue;
        }
      }


      // --- 6. Whitespace ---
      if (/\s/.test(s[i])) {
        let j = i;
        while (j < L && /\s/.test(s[j])) j++;
        this.add('WS', s.slice(i, j), i, j);
        i = j;
        continue;
      }

      // --- 7. Quoted String (FIXED: Added context check for text content) ---
      if (s[i] === '"' || s[i] === "'") {

        // Only tokenize as a STRING if the previous non-WS token was the equals sign,
        // indicating an attribute assignment.
        if (!prevToken || prevToken.value !== '=') {
            // It's text content (e.g., I'm). Let it fall through to Section 10.
            // We MUST NOT advance 'i' here, as Section 10 needs to capture this character.
            // If we advance 'i' here, the character is lost unless captured as UNKNOWN.
            // Since it is a break condition for TEXT, we let TEXT run first.
            // However, since it is a quote, Section 10 will break at this point.
            // We rely on Section 10's fallback to UNKNOWN if it breaks immediately.
        } else {
            // 2. Tokenize as STRING (Valid attribute value)
            const q = s[i];
            let j = i + 1;
            while (j < L && s[j] !== q) {
              if (s[j] === "\\") j += 2;
              else j++;
            }
            const end = Math.min(L, j + 1);
            this.add('STRING', s.slice(i, end), i, end, 'cp-token-string');
            i = end;
            continue;
        }
      }

      // --- 8. HTML Entity ---
      if (s[i] === '&') {
        const entityStart = i;
        let j = i + 1;
        let isHex = false;
        let isValid = false;

        if (s[j] === '#') {
          j++;
          if (s[j] === 'x' || s[j] === 'X') {
            j++;
            isHex = true;
          }
          const identStart = j;
          while (j < L && (isHex ? /[0-9A-Fa-f]/ : /[0-9]/).test(s[j])) j++;
          if (j > identStart) isValid = true;
        } else {
          const identStart = j;
          while (j < L && /[A-Za-z0-9]/.test(s[j])) j++;
          const entityText = s.slice(identStart, j);
          if (entityText.length > 0 && htmlTokens.entities.has(entityText.toLowerCase())) isValid = true;
        }

        if (isValid && j < L && s[j] === ';') {
          j++;
          this.add('ENTITY', s.slice(entityStart, j), entityStart, j, 'cp-token-entity');
          i = j;
          continue;
        }
      }

      // --- 9. IDENTIFIER (Tag/Attribute Name) (FIXED: Context check added) ---
      if (/[A-Za-z0-9_:\-]/.test(s[i])) {
        let j = i;
        while (j < L && /[A-Za-z0-9_:\-]/.test(s[j])) j++;
        const ident = s.slice(i, j);
        const lower = ident.toLowerCase();

        // Determine if we are inside an opening tag context for Attribute Name check
        let isInsideTag = false;
        let k = this.tokens.length - 1;
        while (k >= 0) {
            const token = this.tokens[k];
            if (token.value === '<' || token.value === '</') {
                isInsideTag = true;
                break;
            }
            if (token.value === '>') {
                isInsideTag = false;
                break;
            }
            k--;
        }


        // 1. Tag Name: After '<' or '</'
        if (prevToken && (prevToken.value === '<' || prevToken.value === '</')) {
          const isKnownTag = htmlTokens.tags.has(lower);
          const spanClass = isKnownTag ? 'cp-token-tag' : 'tok-unknown';
          this.add('IDENT', ident, i, j, spanClass);
          i = j;
          continue;
        }

        // 2. Unquoted Attribute Value: After '='
        if (prevToken && prevToken.value === '=') {
          let valEnd = i;
          while (valEnd < L && /[A-Za-z0-9_:\-\.]/.test(s[valEnd])) {
            valEnd++;
          }
          const unquotedValue = s.slice(i, valEnd);

          if (unquotedValue.length > 0) {
            this.add('STRING', unquotedValue, i, valEnd, 'cp-token-string');
            i = valEnd;
            continue;
          }
        }

        // 3. Attribute Name: Only if we are confirmed to be INSIDE an opening tag
        if (isInsideTag) {
          const isKnownAttr = htmlTokens.attributes.has(lower) || isDataAttr(lower) || isAriaAttr(lower);
          const type = isKnownAttr ? 'IDENT' : 'UNKNOWN';
          const spanClass = isKnownAttr ? 'cp-token-attribute' : 'tok-unknown';
          this.add(type, ident, i, j, spanClass);
          i = j;
          continue;
        }

        // Falls through to Section 10 to be collected as TEXT if not in tag/attribute context.
      }

      // --- 10. TEXT (Catches remaining content, including quotes/identifiers not in tag context) ---
      let j = i;
      while (j < L) {
          const ch = s[j];
          // Stop when we hit a character that starts a dedicated high-priority rule block.
          if (ch === '<' || ch === '&') {
            break;
          }
          // Also stop if a potential STRING start is found, UNLESS it's the start of a valid string (Section 7).
          // If Section 7 didn't consume it, we break here to let the quote/apostrophe be handled
          // by the fallback, or captured as part of a larger TEXT chunk if Section 7's check was bypassed.
          // Since Section 7 now has the context check, we can safely allow quotes/apostrophes here
          // (they will be part of the text if not an attribute value)

          j++;
      }

      if (j === i) {
          // If TEXT fails to capture anything, it must be the start of one of the break conditions
          // (", ', <, &) that wasn't successfully processed in a higher section.
          // In the case of quotes/apostrophes, since they are not consumed by Section 7
          // unless preceded by '=', they fall here and are captured as UNKNOWN.
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