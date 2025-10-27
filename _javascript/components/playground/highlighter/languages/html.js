import { BaseHighlighter } from "./../base-highlighter";

export class HtmlHighlighter extends BaseHighlighter {
  constructor() {
    super("html");
  }

  mapTokenTypeToClass(type) {
    switch (type) {
      case "ENTITY":
      case "PROCESSING_INSTRUCTION":
        return "cp-entity";

      case "DOCTYPE":
      case "EQUAL":
        return "cp-keyword";

      case "TAG":
        return "cp-tag";

      case "ATTRIBUTE":
      case "DATA_ATTRIBUTE":
        return "cp-attribute";

      case "DELIMITER":
        return "cp-delimiter";

      case "STRING":
        return "cp-string";

      case "COMMENT":
        return "cp-comment";

      default:
        return null;
    }
  }
}