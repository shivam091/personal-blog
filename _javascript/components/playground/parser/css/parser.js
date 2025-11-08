import { BaseParser } from './../base-parser.js';
import { cssGrammar } from './grammar.js';

export class CssParser extends BaseParser {
  constructor(tokens) {
    super(tokens);

    this.grammar = cssGrammar.rules;
  }

  run() {
    return this.apply(cssGrammar.startRule);
  }
}