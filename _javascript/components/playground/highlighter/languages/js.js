import { BaseHighlighter } from "./../base-highlighter";

export class JsHighlighter extends BaseHighlighter {
  constructor() {
    super("js");
  }

  mapTokenTypeToClass(type) {
    switch (type) {
      case "KEYWORD":
        return "cp-keyword";

      case "GENERAL_IDENTIFIER":
      case "OBJECT_KEY":
        return "cp-variable";

      case "REGEX":
        return "cp-regex";

      case "ARROW":
      case "OPERATOR":
      case "JS_DELIMITER":
        return "cp-delimiter";

      case "TYPE":
        return "cp-type";

      case "GLOBAL_FUNCTION":
        return "cp-function";

      case "GLOBAL_PROPERTY":
        return "cp-builtin";

      case "STRING":
        return "cp-string";

      case "NUMBER":
      case "NUMBER_HEX":
      case "NUMBER_BIN":
      case "NUMBER_OCTAL":
        return "cp-number";

      case "COMMENT":
        return "cp-comment";

      default:
        return null;
    }
  }
}