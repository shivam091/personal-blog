export const cssTokens = {
  commentStart: "/*",
  commentEnd: "*/",
  braceStart: "{",
  braceEnd: "}",
  parenStart: "(",
  parenEnd: ")",
  colon: ":",
  semicolon: ";",
  numberRegex: /^[+-]?(\d*\.\d+|\d+\.?)([Ee][+-]?\d+)?/,
  hexColorCodeRegex: /^([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/,
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
  units: new Set([
    "em", "ex", "ch", "rem", "lh", "rlh", "vw", "vh", "vmin", "vmax", "vb", "vi",
    "svw", "svh", "lvw", "lvh", "dvw", "dvh", "cap", "ic", "px", "cm", "mm", "in",
    "pc", "pt", "s", "ms", "deg", "grad", "rad", "turn", "Hz", "kHz", "dpi",
    "dpcm", "dppx", "%", "fr"
  ]),
};
