import { HtmlLexer } from "./html/lexer";
import { HtmlParser } from "./html/parser";
import { CssLexer } from "./css/lexer";
import { CssParser } from "./css/parser";
import { JsLexer } from "./js/lexer";
import { JsParser } from "./js/parser";

// Defines the Lexer/Parser pipeline for each file type.
export const factories = {
  html: {
    createLexer: (src) => new HtmlLexer(src),
    createParser: (tokens) => new HtmlParser(tokens)
  },
  css: {
    createLexer: (src) => new CssLexer(src),
    createParser: (tokens) => new CssParser(tokens)
  },
  js: {
    createLexer: (src) => new JsLexer(src),
    createParser: (tokens) => new JsParser(tokens)
  }
};
