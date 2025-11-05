import { factories } from './factory.js';
import { highlightFromTokens } from './highlighter.js';

export class LanguageEngine {
  constructor(fileType, src) {
    this.fileType = fileType;
    this.src = src;
    this.lexer = null;
    this.tokens = [];
    this.parser = null;
    this.ast = null;
    this.errors = [];
  }

  run(src = null) {
    if (src !== null) this.src = src;
    const pair = factories[this.fileType];
    if (!pair) throw new Error('Unsupported fileType: ' + this.fileType);
    const { Lexer, Parser } = pair;
    this.lexer = new Lexer(this.src);
    this.tokens = this.lexer.run();
    this.parser = new Parser(this.tokens);
    this.ast = this.parser.run();
    this.errors = this.parser.errors;
    // highlight markup
    this.highlighted = highlightFromTokens(this.src, this.tokens);
    return { tokens: this.tokens, ast: this.ast, errors: this.errors, highlighted: this.highlighted };
  }
}