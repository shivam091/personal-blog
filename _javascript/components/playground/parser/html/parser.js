import { BaseParser } from '../base-parser.js';
import { htmlGrammar } from './grammar.js';

export class HtmlParser extends BaseParser {
  constructor(tokens) { super(tokens); this.grammar = htmlGrammar.rules; }
  run() { return this.apply(htmlGrammar.startRule); }
}