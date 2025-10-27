import { CssHighlighter } from "./languages/css";
import { HtmlHighlighter } from "./languages/html";
import { JsHighlighter } from "./languages/js";
import { CssLexer } from "./lexers/css";
import { HtmlLexer } from "./lexers/html";
import { JsLexer } from "./lexers/js";

/**
 * Central index mapping file types (keys) to their specialized Lexer/Highlighter classes (values).
 * This is where you register new languages.
 */
export const LanguageLexers = {
  css: CssLexer,
  html: HtmlLexer,
  js: JsLexer,
};

export const LanguageHighlighters = {
  css: CssHighlighter,
  html: HtmlHighlighter,
  js: JsHighlighter,
};