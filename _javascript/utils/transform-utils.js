/** Immutable default transform values */
export const DEFAULT_TRANSFORMS = {
  translateX: 0,
  translateY: 0,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0,
  rotate: 0
};

/** Convert CSS transform string into normalized object */
export function parseTransform(transformStr = "") {
  const transformObj = {};

  const translate = transformStr.match(/translate\(\s*([-+]?\d*\.?\d+)(?:px)?\s*,\s*([-+]?\d*\.?\d+)(?:px)?\s*\)/i);
  if (translate) {
    transformObj.translateX = +translate[1];
    transformObj.translateY = +translate[2];
  }

  const scale = transformStr.match(/scale\(\s*([-+]?\d*\.?\d+)(?:\s*,\s*([-+]?\d*\.?\d+))?\s*\)/i);
  if (scale) {
    transformObj.scaleX = +scale[1];
    transformObj.scaleY = scale[2] ? +scale[2] : +scale[1];
  }

  const skew = transformStr.match(/skew\(\s*([-+]?\d*\.?\d+)(?:deg)?\s*,\s*([-+]?\d*\.?\d+)(?:deg)?\s*\)/i);
  if (skew) {
    transformObj.skewX = +skew[1];
    transformObj.skewY = +skew[2];
  }

  const skewX = transformStr.match(/skewX\(\s*([-+]?\d*\.?\d+)(?:deg)?\s*\)/i);
  if (skewX) transformObj.skewX = +skewX[1];

  const skewY = transformStr.match(/skewY\(\s*([-+]?\d*\.?\d+)(?:deg)?\s*\)/i);
  if (skewY) transformObj.skewY = +skewY[1];

  const rotate = transformStr.match(/rotate\(\s*([-+]?\d*\.?\d+)(?:deg)?\s*\)/i);
  if (rotate) transformObj.rotate = +rotate[1];

  return transformObj;
}

/** Convert transform object back to CSS transform string */
export function toTransformString(transformObj = {}) {
  const transformStr = [];

  if ("translateX" in transformObj || "translateY" in transformObj) {
    const translateX = +(transformObj.translateX ?? 0);
    const translateY = +(transformObj.translateY ?? 0);
    transformStr.push(`translate(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px)`);
  }

  if ("scaleX" in transformObj || "scaleY" in transformObj) {
    const scaleX = +(transformObj.scaleX ?? 1);
    const scaleY = +(transformObj.scaleY ?? scaleX);
    transformStr.push(`scale(${scaleX.toFixed(2)}, ${scaleY.toFixed(2)})`);
  }

  if ("skewX" in transformObj || "skewY" in transformObj) {
    const skewX = +(transformObj.skewX ?? 0);
    const skewY = +(transformObj.skewY ?? 0);
    transformStr.push(`skew(${skewX.toFixed(2)}deg, ${skewY.toFixed(2)}deg)`);
  }

  if ("rotate" in transformObj) {
    const rotate = +(transformObj.rotate ?? 0);
    transformStr.push(`rotate(${rotate.toFixed(2)}deg)`);
  }

  return transformStr.join(" ");
}
