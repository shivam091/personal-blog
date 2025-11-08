import { highlightFromTokens } from '../highlighter.js';

export function highlightHTML(src, tokens) {
  return highlightFromTokens(src, tokens);
}