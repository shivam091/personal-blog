import { htmlTokens } from "../tokens";
import { BaseLexer } from "./../base-lexer";

export class HtmlLexer extends BaseLexer {
  constructor() {
    super({
      comment: /(<!--[\s\S]*?-->)/,
      structural: {
        ENTITY: /(&#?\w+;)/,
        PROCESSING_INSTRUCTION: /(<\?[\s\S]*?\?>)/,
        DOCTYPE: /(<!DOCTYPE[\s\S]*?>)/i,
        DELIMITER: /(<\/?|>|\/?>)/,
        EQUAL: /(=)/,
        DATA_ATTRIBUTE: /(\b(data)-[a-zA-Z0-9-]+)\b/,
      },
      words: {
        TAG: htmlTokens.tags,
        ATTRIBUTE: htmlTokens.attributes,
      },
    });
  }
}
