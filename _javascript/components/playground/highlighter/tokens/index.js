import { jsTokens } from "./js";
import { htmlTokens } from "./html";
import { cssTokens } from "./css";

const SHARED_TOKEN_TYPES = {
  STRING: /(".*?"|'.*?'|`[\s\S]*?`)/,
  NUMBER: /(\b\d+(\.\d+)?\b)/,
  PLAIN: /.+/, // Fallback
};

export {
  SHARED_TOKEN_TYPES,
  jsTokens,
  htmlTokens,
  cssTokens
};