import { BaseParser } from "./../base-parser";
import { cssGrammar } from "./grammar";

export class CssParser extends BaseParser {
  constructor(tokens) {
    super(tokens);

    this.grammar = cssGrammar.rules;
  }

  run() {
    return this.apply(cssGrammar.startRule);
  }
}