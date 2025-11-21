import { escapeHTML } from './utils.js';

function escapeWithWhitespace(value) {
  // fully escape
  const escaped = escapeHTML(value);
  // then replace space and tab
  return escaped
    .replace(/ /g, "<span class='cp-token-space'> </span>")
    .replace(/\t/g, "<span class='cp-token-tab'>\t</span>");
}

export function highlightFromTokens(src, tokens) {
  let highlightedHtml = '';
  let last = 0;

  for (const token of tokens) {
    if (token.start > last) {
      // plain segment before token
      const raw = src.slice(last, token.start);
      highlightedHtml += escapeWithWhitespace(raw);
    }

    const rawVal = src.slice(token.start, token.end);
    const cls = token.spanClass || '';
    highlightedHtml += `<span class="cp-token ${cls}">${escapeWithWhitespace(rawVal)}</span>`;
    last = token.end;
  }

  if (last < src.length) {
    const rest = src.slice(last);
    highlightedHtml += escapeWithWhitespace(rest);
  }

  return highlightedHtml;
}