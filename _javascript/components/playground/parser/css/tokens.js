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
  pseudoClasses: new Set([
    "active", "any-link", "blank", "checked", "current", "default", "defined", "dir", "disabled",
    "drop", "empty", "enabled", "first", "first-child", "first-of-type", "fullscreen", "future",
    "focus", "focus-visible", "focus-within", "has", "host", "host-context", "hover", "indeterminate",
    "in-range", "invalid", "is", "lang", "last-child", "last-of-type", "left", "link", "local-link",
    "not", "nth-child", "nth-col", "nth-last-child", "nth-last-col", "nth-last-of-type", "nth-of-type",
    "only-child", "only-of-type", "optional", "out-of-range", "past", "placeholder-shown", "read-only",
    "read-write", "required", "right", "root", "scope", "target", "target-within", "user-invalid",
    "valid", "visited", "where"
  ]),
  pseudoElements: new Set([
    "after", "backdrop", "before", "cue", "cue-region", "first-letter", "first-line", "grammar-error",
    "marker", "part", "placeholder", "selection", "slotted", "spelling-error"
   ]),
};
