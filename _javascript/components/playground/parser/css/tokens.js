export const cssTokens = {
  commentStart: "/*",
  commentEnd: "*/",
  braceStart: "{",
  braceEnd: "}",
  numberRegex: /^[+-]?(\d*\.\d+|\d+\.?)([Ee][+-]?\d+)?/,
  hexColorCodeRegex: /^([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/,
  units: new Set([
    "em", "ex", "ch", "rem", "lh", "rlh", "vw", "vh", "vmin", "vmax", "vb", "vi",
    "svw", "svh", "lvw", "lvh", "dvw", "dvh", "cap", "ic", "px", "cm", "mm", "in",
    "pc", "pt", "s", "ms", "deg", "grad", "rad", "turn", "Hz", "kHz", "dpi",
    "dpcm", "dppx", "%", "fr"
  ]),
};
