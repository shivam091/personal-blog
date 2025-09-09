import { parseTransform, toTransformString } from "./../../transform-utils";

// Adapter for animating <use> attributes with springs
export const UseAdapter = {
  // Extracts attributes from <use> element
  extractAttributes: (el) => ({
    x: +el.getAttribute("x") || 0,
    y: +el.getAttribute("y") || 0,
    width: +el.getAttribute("width") || 0,
    height: +el.getAttribute("height") || 0,
    opacity: +el.getAttribute("opacity") || 1,
    fillOpacity: +el.getAttribute("fill-opacity") || 1,
    strokeOpacity: +el.getAttribute("stroke-opacity") || 1,
    ...parseTransform(el.getAttribute("transform") || "")
  }),

  // Apply state values back to <use> element
  setAttributes: (el, group) => {
    const {
      x, y, width, height, opacity, fillOpacity, strokeOpacity,
      translateX, translateY, scaleX, scaleY, rotate, skewX, skewY
    } = group.getState();

    el.setAttribute("x", x.toFixed(2));
    el.setAttribute("y", y.toFixed(2));
    el.setAttribute("width", width.toFixed(2));
    el.setAttribute("height", height.toFixed(2));
    el.setAttribute("opacity", opacity.toFixed(2));
    el.setAttribute("fill-opacity", fillOpacity.toFixed(2));
    el.setAttribute("stroke-opacity", strokeOpacity.toFixed(2));

    // SVG-mode: unitless
    el.setAttribute("transform", toTransformString({
      translateX, translateY, scaleX, scaleY, rotate, skewX, skewY
    }, { svg: true }));
  }
};

