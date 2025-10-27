import { jsTokens } from "../tokens";
import { BaseLexer } from "./../base-lexer";

export class JsLexer extends BaseLexer {
  constructor() {
    super({
      comment: /(\/\/.*)/,
      structural: {
        ARROW: /(=>)/,
        REGEX: /(\/.*?\/(?:[gimyus]{1,6})?\b)/,
        OPERATOR: jsTokens.operators,
        JS_DELIMITER: /([{}()\[\]:;])/,
        OBJECT_KEY: /([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*:)/,
        NUMBER_HEX: /(\b0x[0-9a-fA-F]+\b)/,
        NUMBER_BIN: /(\b0b[01]+\b)/,
        NUMBER_OCTAL: /(\b0o[0-7]+\b)/,
      },
      words: {
        KEYWORD: jsTokens.keywords,
        TYPE: jsTokens.types,
        GLOBAL_FUNCTION: jsTokens.globalFunctions,
        GLOBAL_PROPERTY: jsTokens.globalProperties,
        GENERAL_IDENTIFIER: jsTokens.generalIdentifiers,
      },
    });
  }
}