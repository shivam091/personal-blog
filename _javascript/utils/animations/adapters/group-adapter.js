import { parseTransform, toTransformString } from "../../transform-utils";

// Adapter for animating <g> attributes with springs
export const GroupAdapter = {
  // Extract attributes from <g> element
  extractAttributes: (el) => ({
    opacity: +el.getAttribute("opacity") || 1,
    strokeWidth: +el.getAttribute("stroke-width") || 1,
    fillOpacity: +el.getAttribute("fill-opacity") || 1,
    strokeOpacity: +el.getAttribute("stroke-opacity") || 1,
    ...parseTransform(el.getAttribute("transform") || "")
  }),

  // Apply state values back to <g> element
  setAttributes: (el, group) => {
    const {
      opacity, strokeWidth, fillOpacity, strokeOpacity,
      translateX, translateY, scaleX, scaleY, rotate, skewX, skewY
    } = group.getState();

    el.setAttribute("opacity", opacity.toFixed(2));
    el.setAttribute("stroke-width", strokeWidth.toFixed(2));
    el.setAttribute("fill-opacity", fillOpacity.toFixed(2));
    el.setAttribute("stroke-opacity", strokeOpacity.toFixed(2));

    el.setAttribute("transform", toTransformString({
      translateX, translateY, scaleX, scaleY, rotate, skewX, skewY
    }, { svg: true }));
  }
};
