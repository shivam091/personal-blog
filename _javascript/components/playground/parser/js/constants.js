export const jsTokens = {
  commentStart: "/*",
  commentEnd: "*/",
  singleLineComment: "//",
  braceStart: "{",
  braceEnd: "}",
  parenStart: "(",
  parenEnd: ")",
  bracketStart: "[",
  bracketEnd: "]",
  templateLiteral: '`',
  templateExprStart: '${',
  templateExprEnd: '}',
  operators: new Set([
    ">>>=", "<<<=", "**=", "===", "!==", ">>>", "<<=", ">>=", "&&=", "||=", "??=",
    "++", "--", "+=", "-=", "*=", "/=", "%=", "==", "!=", ">=", "<=", "&&", "||",
    "&=", "|=", "^=", "<<", ">>", "=>", "??", "**", "...", "+", "-", "*", "/", "%",
    "<", ">", "=", "!", "&", "|", "^", "~", "?", ":", ".", ",", ";"
  ])
};
