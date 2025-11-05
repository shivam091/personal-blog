export const cssTokens = {
  atRules: new Set([
    "@charset", "@import", "@media", "@supports", "@keyframes", "@font-face", "@page",
    "@layer", "@container"
  ]),
  properties: new Set([
    "color", "background", "font-size", "width", "height", "margin", "padding",
    "border-radius", "border", "display", "position", "top", "left", "right", "bottom", "z-index",
    "text-align", "line-height", "overflow", "opacity", "cursor", "box-shadow",
    "text-shadow", "transform", "transition", "animation", "flex",
  ]),
  logicalProperties: new Set([
    "flex", "grid", "justify-content", "align-items", "gap", "grid-template-columns",
    "flex-direction", "flex-wrap", "align-self"
  ]),
  cssFunctions: new Set([
    "calc", "min", "max", "var", "attr", "linear-gradient", "rgb", "rgba", "hsl", "hsla"
  ]),
  units: new Set([
    "%", "em", "ex", "ch", "rem" , "vw", "vh", "vmin", "vmax" , "cm", "mm", "in", "pt",
    "pc", "px" , "deg", "grad", "rad", "turn" , "s", "ms" , "Hz", "kHz" , "dpi", "dpcm",
    "dppx"
  ]),
  values: new Set([
    "auto", "none", "inherit", "initial", "unset", "solid", "dashed", "dotted",
    "block", "inline", "flex", "grid", "absolute", "relative", "fixed", "hidden",
    "visible", "center", "left", "right", "top", "bottom", "middle", "start", "end"
  ]),
  colorKeywords: new Set([
    "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black",
    "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse",
    "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue",
    "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki",
    "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon",
    "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise",
    "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick",
    "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod",
    "gray", "green", "greenyellow", "grey", "honeydew", "hotpink", "indianred", "indigo",
    "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue",
    "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey",
    "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray",
    "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta",
    "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen",
    "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue",
    "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab",
    "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred",
    "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple",
    "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell",
    "sienna", "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen",
    "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white",
    "whitesmoke", "yellow", "yellowgreen"
  ]),
  mediaFeatures: new Set([
    "any-hover", "any-pointer", "aspect-ratio", "color", "color-gamut", "color-index",
    "device-aspect-ratio", "device-height", "device-width", "display-mode", "forced-colors",
    "grid", "height", "hover", "inverted-colors", "min-height", "max-height", "min-width", "max-width",
    "monochrome", "orientation", "overflow-block",  "overflow-inline", "pointer", "prefers-color-scheme",
    "prefers-contrast", "prefers-reduced-motion",  "prefers-reduced-transparency", "resolution",
    "scan", "scripting", "update", "width"
  ]),
};