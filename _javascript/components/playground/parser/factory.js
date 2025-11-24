import { HtmlLexer } from "./html/lexer";
import { HtmlParser } from "./html/parser";
import { CssLexer } from "./css/lexer";
import { CssParser } from "./css/parser";
import { JsLexer } from "./js/lexer";
import { JsParser } from "./js/parser";
import { highlightFromTokens } from "./highlighter"

export const factories = {
  html: {
    createLexer: (src) => new HtmlLexer(src),
    createParser: (tokens) => new HtmlParser(tokens),
    highlighter: highlightFromTokens
  },
  css: {
    createLexer: (src) => new CssLexer(src),
    createParser: (tokens) => new CssParser(tokens),
    highlighter: highlightFromTokens
  },
  js: {
    createLexer: (src) => new JsLexer(src),
    createParser: (tokens) => new JsParser(tokens),
    highlighter: highlightFromTokens
  },
};