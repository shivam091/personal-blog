import { BaseHighlighter } from "./../base-highlighter";

export class CssHighlighter extends BaseHighlighter {
  constructor() {
    super("css");
  }

  mapTokenTypeToClass(type) {
    switch (type) {
      case "AT_RULE":
        return "cp-keyword";

      case "CSS_FUNCTION":
      case "COLOR_FUNC":
      case "URL_FUNC":
        return "cp-function";

      case "ID_SELECTOR":
      case "CLASS_SELECTOR":
      case "UNIVERSAL_SELECTOR":
        return "cp-selector";

      case "TYPE_SELECTOR":
        return "cp-tag";

      case "PSEUDO":
      case "PROPERTY":
        return "cp-attribute";

      case "LOGICAL_PROPERTY":
        return "cp-type";

      case "CSS_VARIABLE":
        return "cp-variable";

      case "VALUE":
        return "cp-builtin";

      case "STRING":
        return "cp-string";

      case "NUMBER":
      case "NUMBER_UNIT":
      case "COLOR_HEX":
        return "cp-number";

      case "COMMENT":
        return "cp-comment";

      case "DELIMITER":
        return "cp-delimiter";

      default:
        return null;
    }
  }
}