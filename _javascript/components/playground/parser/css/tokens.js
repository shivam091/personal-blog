export const cssTokens = {
  commentStart: "/*",
  commentEnd: "*/",
  braceStart: "{",
  braceEnd: "}",
  numberRegex: /^[+-]?(\d*\.\d+|\d+\.?)([Ee][+-]?\d+)?/,
  units: new Set([
    "em", "ex", "ch", "rem", "lh", "rlh", "vw", "vh", "vmin", "vmax", "vb", "vi",
    "svw", "svh", "lvw", "lvh", "dvw", "dvh", "cap", "ic", "px", "cm", "mm", "in",
    "pc", "pt", "s", "ms", "deg", "grad", "rad", "turn", "Hz", "kHz", "dpi",
    "dpcm", "dppx", "%", "fr"
  ]),
};
