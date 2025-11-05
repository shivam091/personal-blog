import { HtmlLexer } from './html/lexer.js';
import { HtmlParser } from './html/parser.js';
import { CssLexer } from './css/lexer.js';
import { CssParser } from './css/parser.js';
import { JsLexer } from './js/lexer.js';
import { JsParser } from './js/parser.js';

export const factories = {
  html: { Lexer: HtmlLexer, Parser: HtmlParser },
  css: { Lexer: CssLexer, Parser: CssParser },
  js: { Lexer: JsLexer, Parser: JsParser }
};