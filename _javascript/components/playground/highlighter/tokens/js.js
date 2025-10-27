export const jsTokens = {
  operators: /(\+\+|\-\-|\+=|-=|\*=|%=|\*\*|&&|\|\||\?|\.{3}|[+\-*/%^&=!<>~])/,
  keywords: new Set([
    "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete",
    "do", "else", "export", "extends", "finally", "for", "function", "if", "import",
    "in", "instanceof", "new", "return", "super", "switch", "this", "throw", "try",
    "typeof", "var", "void", "while", "with", "yield", "await", "enum", "implements",
    "interface", "package", "private", "protected", "public", "static", "let", "of",
  ]),
  types: new Set([
    "string", "number", "boolean", "null", "undefined", "symbol", "bigint", "object", "Array",
    "Map", "Set", "Promise", "Date", "RegExp", "Error", "Function", "Object",
  ]),
  globalFunctions: new Set([
    "isFinite", "isNaN", "parseFloat", "parseInt", "decodeURI", "decodeURIComponent",
    "encodeURI", "encodeURIComponent", "eval", "globalThis",
  ]),
  globalProperties: new Set(["Infinity", "NaN", "undefined"]),
  generalIdentifiers: new Set(["document", "window", "console", "fetch", "localStorage", "setTimeout"]),
};
