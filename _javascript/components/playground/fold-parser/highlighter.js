import { escapeHTML } from "./utils";

export function highlightFromTokens(src, tokens) {
  let highlightedHtml = "";
  let last = 0;

  for (const token of tokens) {
    if (token.start > last) {
      // plain segment before token
      const raw = src.slice(last, token.start);
      highlightedHtml += escapeHTML(raw);
    }

    const rawVal = src.slice(token.start, token.end);

    highlightedHtml += `<span class="cp-token ${token.spanClass}">${escapeHTML(rawVal)}</span>`;
    last = token.end;
  }

  if (last < src.length) {
    const rest = src.slice(last);
    highlightedHtml += escapeHTML(rest);
  }

  return highlightedHtml;
}
