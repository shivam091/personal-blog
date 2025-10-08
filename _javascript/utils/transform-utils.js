import deepFreeze from "./deep-freeze";

// Immutable default transform values
export const DEFAULT_TRANSFORMS = deepFreeze({
  translateX: 0,
  translateY: 0,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0,
  rotate: 0
});

// Combined regex to match all CSS transforms in one pass
// Captures translate, scale, skew, skewX, skewY, rotate
const TRANSFORM_REGEX = /\b(?<type>translate|scale|skew|skewX|skewY|rotate)\(\s*(?<v1>[-+]?\d*\.?\d+)(?:px|deg)?(?:\s*,\s*(?<v2>[-+]?\d*\.?\d+)(?:px|deg)?)?\s*\)/gi;

// Parses a CSS transform string into a normalized object
export function parseTransform(transformStr = "") {
  const transformObj = { ...DEFAULT_TRANSFORMS };

  let match;
  while ((match = TRANSFORM_REGEX.exec(transformStr)) !== null) {
    const { type, v1, v2 } = match.groups;
    const num1 = +v1;
    const num2 = v2 !== undefined ? +v2 : undefined;

    switch (type) {
      case "translate":
        transformObj.translateX = num1;
        transformObj.translateY = num2 ?? 0;
        break;
      case "scale":
        transformObj.scaleX = num1;
        transformObj.scaleY = num2 ?? num1;
        break;
      case "skew":
        transformObj.skewX = num1;
        transformObj.skewY = num2 ?? 0;
        break;
      case "skewX":
        transformObj.skewX = num1;
        break;
      case "skewY":
        transformObj.skewY = num1;
        break;
      case "rotate":
        transformObj.rotate = num1;
        break;
    }
  }

  return transformObj;
}

// Converts a transform object back to a CSS transform string
export function toTransformString(transformObj = {}) {
  const transformStr = [];

  const tX = +(transformObj.translateX ?? 0);
  const tY = +(transformObj.translateY ?? 0);
  if (tX !== 0 || tY !== 0) transformStr.push(`translate(${tX.toFixed(2)}px, ${tY.toFixed(2)}px)`);

  const sX = +(transformObj.scaleX ?? 1);
  const sY = +(transformObj.scaleY ?? sX);
  if (sX !== 1 || sY !== 1) transformStr.push(`scale(${sX.toFixed(2)}, ${sY.toFixed(2)})`);

  const skX = +(transformObj.skewX ?? 0);
  const skY = +(transformObj.skewY ?? 0);
  if (skX !== 0 || skY !== 0) transformStr.push(`skew(${skX.toFixed(2)}deg, ${skY.toFixed(2)}deg)`);

  const rot = +(transformObj.rotate ?? 0);
  if (rot !== 0) transformStr.push(`rotate(${rot.toFixed(2)}deg)`);

  return transformStr.join(" ");
}
