import { cssTokens, htmlTokens } from "../tokens";
import { BaseLexer } from "./../base-lexer";

export class CssLexer extends BaseLexer {
  constructor() {
    const unitPatterns = [...cssTokens.units].join("|");

    const CSS_NUMBER_WITH_UNIT_REGEX = new RegExp(
      // Match: (full number, e.g., 100 or 1.25) OR (number starting with dot, e.g., .25)
      `(\\b\\d+\\.?\\d*|\\.\\d+)(${unitPatterns})`,
      "i"
    );
    const AT_RULE_REGEX = new RegExp(`(${[...cssTokens.atRules].join("|")})\\b`, "i");
    const TYPE_SELECTOR_REGEX = new RegExp(`\\b(${[...htmlTokens.tags].join("|")})\\b`);

    super({
      comment: /(\/\*[\s\S]*?\*\/)/,
      structural: {
        NUMBER_UNIT: CSS_NUMBER_WITH_UNIT_REGEX,
        NUMBER: /(\b\d+\.?\d*|\.\d+)\b/,
        COLOR_HEX: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/,
        AT_RULE: AT_RULE_REGEX,
        ID_SELECTOR: /(#[a-zA-Z0-9_-]+)/,
        CLASS_SELECTOR: /(\.[a-zA-Z0-9_-]+)/,
        UNIVERSAL_SELECTOR: /(\*)/,
        TYPE_SELECTOR: TYPE_SELECTOR_REGEX,
        COLOR_FUNC: /(rgba?|hsla?)\([^\)]*\)/,
        URL_FUNC: /(url\([^\)]*\))/,
        DELIMITER: /([{}];)/,
        PSEUDO: /(:{1,2}[a-zA-Z0-9_-]+)/,
        CSS_VARIABLE: /--[A-Za-z_][A-Za-z0-9_-]*/,
      },
      words: {
        PROPERTY: cssTokens.properties,
        LOGICAL_PROPERTY: cssTokens.logicalProperties,
        CSS_FUNCTION: cssTokens.cssFunctions,
        VALUE: cssTokens.values,
      },
    });
  }
}