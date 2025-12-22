import { HtmlLexer } from "./html/lexer";
import { HtmlParser } from "./html/parser";
import { CssLexer } from "./css/lexer";
import { CssParser } from "./css/parser";
import { JsLexer } from "./js/lexer";
import { JsParser } from "./js/parser";

// Defines the Lexer/Parser pipeline for each file type.
export const factories = {
  html: {
    lexer: (src) => new HtmlLexer(src),
    parser: (tokens) => new HtmlParser(tokens)
  },
  css: {
    lexer: (src) => new CssLexer(src),
    parser: (tokens) => new CssParser(tokens)
  },
  js: {
    lexer: (src) => new JsLexer(src),
    parser: (tokens) => new JsParser(tokens)
  }
};
