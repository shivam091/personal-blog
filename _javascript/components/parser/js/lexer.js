import { BaseLexer } from '../base-lexer.js';

const keywords = new Set(['var', 'let', 'const', 'function', 'if', 'else', 'return', 'for', 'while', 'break', 'continue', 'switch', 'case', 'new', 'this', 'class', 'extends', 'import', 'from', 'export', 'default', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'in', 'of']);
const isIdentStart = ch => /[A-Za-z_$]/.test(ch);
const isIdentPart = ch => /[A-Za-z0-9_$]/.test(ch);

export class JsLexer extends BaseLexer {
  run() {
    const s = this.input; let i = 0, L = s.length;
    while (i < L) {
      const start = i; const ch = s[i];
      if (/\s/.test(ch)) { let j = i; while (j < L && /\s/.test(s[j])) j++; this.add('WS', s.slice(i, j), i, j, ''); i = j; continue; }
      if (s.startsWith('//', i)) { let j = s.indexOf('\n', i + 2); if (j === -1) j = L; this.add('COMMENT', s.slice(i, j), i, j, 'tok-comment'); i = j; continue; }
      if (s.startsWith('/*', i)) { let j = s.indexOf('*/', i + 2); if (j === -1) j = L; else j += 2; this.add('COMMENT', s.slice(i, j), i, j, 'tok-comment'); i = j; continue; }
      if (ch === '"' || ch === "'" || ch === '`') { const q = ch; let j = i + 1; while (j < L) { if (s[j] === '\\') j += 2; else if (s[j] === q) { j++; break; } else j++; } this.add('STRING', s.slice(i, j), i, j, 'tok-string'); i = j; continue; }
      if (/[0-9]/.test(ch)) { let j = i; while (j < L && /[0-9.]/.test(s[j])) j++; this.add('NUMBER', s.slice(i, j), i, j, 'tok-number'); i = j; continue; }
      if (isIdentStart(ch)) { let j = i + 1; while (j < L && isIdentPart(s[j])) j++; const v = s.slice(i, j); this.add(keywords.has(v) ? 'KEYWORD' : 'IDENT', v, i, j, keywords.has(v) ? 'tok-keyword' : 'tok-ident'); i = j; continue; }
      // multi-char punctuators
      const two = s.slice(i, i + 2); const three = s.slice(i, i + 3);
      const multi = new Set(['===', '!==', '==', '!=', '=>', '&&', '||', '<=', '>=', '++', '--', '+=', '-=', '*=', '/=', '%=']);
      if (multi.has(three)) { this.add('PUNC', three, i, i + 3, 'tok-punc'); i += 3; continue; }
      if (multi.has(two)) { this.add('PUNC', two, i, i + 2, 'tok-punc'); i += 2; continue; }
      const single = '{}[]().,;:+-*/%<>?=~!&|^';
      if (single.includes(ch)) { this.add('PUNC', ch, i, i + 1, 'tok-punc'); i++; continue; }
      this.add('UNKNOWN', ch, i, i + 1, 'tok-unknown'); i++;
    }
    return this.tokens;
  }
}