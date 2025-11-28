export const cssTokens = {
  commentStart: "/*",
  commentEnd: "*/",
  braceStart: "{",
  braceEnd: "}",
  parenStart: "(",
  parenEnd: ")",
  colon: ":",
  semicolon: ";",
  atRules: new Set([
    "@charset", "@container", "@counter-style", "@document", "@font-face", "@font-palette-values",
    "@import", "@keyframes", "@layer", "@media", "@namespace", "@ornaments", "@page", "@property",
    "@scope", "@starting-style", "@supports", "@swash", "@viewport"
  ]),
  functions: new Set([
    "abs", "acos", "asin", "atan", "atan2", "attr", "blur", "brightness",
    "calc", "circle", "clamp", "color", "color-contrast", "color-mix",
    "conic-gradient", "contrast", "cos", "counter", "counters", "cross-fade",
    "cubic-bezier", "drop-shadow", "ellipse", "env", "exp", "fit-content",
    "format", "grayscale", "hsl", "hsla", "hue-rotate", "hwb", "hypot", "image",
    "image-set", "inset", "invert", "lab", "lch", "light-dark",
    "linear-gradient", "log", "matrix", "matrix3d", "max", "min", "minmax",
    "mod", "oklab", "oklch", "opacity", "path", "perspective", "polygon", "pow",
    "radial-gradient", "ray", "rem", "repeat", "repeating-conic-gradient",
    "repeating-linear-gradient", "repeating-radial-gradient", "rgb", "rgba",
    "rotate", "rotate3d", "rotateX", "rotateY", "rotateZ", "round", "saturate",
    "scale", "scale3d", "scaleX", "scaleY", "scaleZ", "sepia", "sign", "sin",
    "skew", "skewX", "skewY", "sqrt", "steps", "symbols", "tan", "translate",
    "translate3d", "translateX", "translateY", "translateZ", "url", "var"
  ]),
};
