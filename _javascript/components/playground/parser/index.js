import { cssGrammar } from "./grammers/css.js";
import { htmlGrammar } from "./grammers/html.js";
import { javascriptGrammar } from "./grammers/javascript.js";
import { GenericParser } from "./parser-core.js";
import { createTokenizer } from "./tokenizer.js";

const grammars = { js: javascriptGrammar, html: htmlGrammar, css: cssGrammar };
const defaultTokenizer = createTokenizer(["\\s+", "\\w+", "\\d+", "\\W"]);

export function parseCode(source, fileType) {
  const grammar = grammars[fileType];
  if (!grammar) return null;
  const parser = new GenericParser(grammar, { tokenizer: defaultTokenizer });
  return parser.parse(source);
}
