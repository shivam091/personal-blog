import { BaseParser } from '../base-parser.js';
import { jsGrammar } from './grammar.js';

export class JsParser extends BaseParser {
  constructor(tokens) { super(tokens); this.grammar = jsGrammar.rules; }
  run() { return this.apply(jsGrammar.startRule); }
}