export const cssTokens = {
  atRules: new Set([
    "@charset", "@import", "@media", "@supports", "@keyframes", "@font-face", "@page",
    "@layer", "@container"
  ]),
  properties: new Set([
    "color", "background", "font-size", "width", "height", "margin", "padding",
    "border-radius", "border", "display", "position", "top", "left", "right", "bottom", "z-index",
    "text-align", "line-height", "overflow", "opacity", "cursor", "box-shadow",
    "text-shadow", "transform", "transition", "animation"
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
};
