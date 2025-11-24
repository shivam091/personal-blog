import { BaseParser } from "./../base-parser";
import { htmlGrammar } from "./grammar";

export class HtmlParser extends BaseParser {
  constructor(tokens) {
    super(tokens);
    this.grammar = htmlGrammar.rules;
  }

  run() {
    return this.apply(htmlGrammar.startRule);
  }
}