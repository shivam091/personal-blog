import { BaseParser } from "./../base-parser";
import { jsGrammar } from "./grammar";

export class JsParser extends BaseParser {
  constructor(tokens) {
    super(tokens);
    this.grammar = jsGrammar.rules;
  }

  run() {
    return this.apply(jsGrammar.startRule);
  }
}