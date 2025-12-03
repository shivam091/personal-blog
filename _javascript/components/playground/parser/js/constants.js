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
  ]),
  keywords: new Set([
    "var", "let", "const", "function", "if", "else", "return", "for", "while",
    "break", "continue", "switch", "case", "new", "class", "extends", "import",
    "from", "export", "default", "try", "catch", "finally", "throw", "typeof",
    "instanceof", "in", "of", "do", "yield", "await", "debugger", "with",
    "delete", "void", "enum", "public", "private", "protected", "static",
    "implements", "interface", "package", "namespace"
  ]),
  literals: new Set([
    "true", "false", "null", "undefined", "NaN", "Infinity"
  ]),
  builtInGlobals: new Set([
    "Array", "Object", "Function", "Boolean", "String", "Number", "Date", "RegExp", "Map",
    "WeakMap", "Set", "WeakSet", "Promise", "Symbol", "BigInt", "JSON", "Math", "Reflect",
    "Proxy", "Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array",
    "Int32Array", "Uint32Array", "Float32Array", "Float64Array", "BigInt64Array",
    "BigUint64Array", "isFinite", "isNaN", "parseFloat", "parseInt", "decodeURI", "encodeURI",
    "decodeURIComponent", "encodeURIComponent", "eval", "setInterval", "setTimeout",
    "clearInterval", "clearTimeout", "Error", "EvalError", "RangeError", "ReferenceError",
    "SyntaxError", "TypeError", "URIError", "XMLHttpRequest", "WebSocket", "EventSource",
    "URL", "URLSearchParams", "Request", "Response", "Headers", "Blob", "File", "FormData",
    "AbortController", "AbortSignal", "Image", "queueMicrotask", "requestAnimationFrame",
    "cancelAnimationFrame"
  ]),
  builtInVariables: new Set([
    "arguments", "this", "super", "console", "window", "self", "globalThis", "document",
    "localStorage", "sessionStorage", "navigator", "history", "location", "module",
    "exports", "global"
  ]),
  domMethods: new Set([
    "getElementById", "getElementsByTagName", "getElementsByClassName", "querySelector",
    "querySelectorAll", "createElement", "createTextNode", "createDocumentFragment",
    "createComment", "createEvent", "createRange", "createNodeIterator", "createTreeWalker",
    "importNode", "adoptNode", "getSelection", "appendChild", "removeChild", "insertBefore",
    "replaceChild", "append", "prepend", "after", "before", "remove", "replaceWith",
    "cloneNode", "contains", "closest", "matches", "setAttribute", "getAttribute",
    "removeAttribute", "toggleAttribute", "hasAttribute", "addEventListener",
    "removeEventListener", "dispatchEvent", "preventDefault", "stopPropagation", "focus",
    "blur", "click", "submit", "scroll", "scrollTo", "scrollBy", "scrollIntoView",
    "getBoundingClientRect", "attachShadow", "getRootNode", "classList", "style", "dataset",
    "innerHTML", "innerText", "textContent"
  ]),
};
