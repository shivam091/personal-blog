export const jsTokens = {
  keywords: new Set([
    "var", "let", "const", "function", "if", "else", "return", "for", "while",
    "break", "continue", "switch", "case", "new", "class", "extends", "import",
    "from", "export", "default", "try", "catch", "finally", "throw", "typeof",
    "instanceof", "in", "of", "do", "yield", "await", "debugger", "with",
  ]),
  builtInGlobals: new Set([
    "Array", "Object", "Function", "Boolean", "String", "Number", "Date", "RegExp",
    "Map", "Set", "Promise", "Symbol", "JSON", "Math", "Reflect", "Proxy",
    "isFinite", "isNaN", "parseFloat", "parseInt", "decodeURI", "encodeURI",
    "decodeURIComponent", "encodeURIComponent", "eval", "setInterval", "setTimeout",
    "clearInterval", "clearTimeout", "require", "exports",
    "globalThis", "escape", "unescape"
  ]),
  errorTypes: new Set([
    "Error", "EvalError", "InternalError", "RangeError", "ReferenceError",
    "SyntaxError", "TypeError", "URIError",
  ]),
  literals: new Set([
    "true", "false", "null", "undefined", "NaN", "Infinity"
  ]),
  builtInVariables: new Set([
    "arguments", "this", "super", "console", "window", "document", "localStorage",
    "sessionStorage", "module", "global"
  ]),
}