// Adapter for animating <rect> attributes with springs
export const RectAdapter = {
  // Extracts attributes from <rect> element
  extractAttributes: (el) => ({
    x: +el.getAttribute("x") || 0,
    y: +el.getAttribute("y") || 0,
    rx: +el.getAttribute("rx") || 0,
    ry: +el.getAttribute("ry") || 0,
    width: +el.getAttribute("width") || 0,
    height: +el.getAttribute("height") || 0,
    opacity: +el.getAttribute("opacity") || 1,
    fillOpacity: +el.getAttribute("fill-opacity") || 1,
    strokeOpacity: +el.getAttribute("stroke-opacity") || 1
  }),

  // Apply state values back to <rect> element
  setAttributes: (el, group) => {
    const { x, y, rx, ry, width, height, opacity, fillOpacity, strokeOpacity } = group.getState();

    el.setAttribute("x", x.toFixed(2));
    el.setAttribute("y", y.toFixed(2));
    el.setAttribute("rx", rx.toFixed(2));
    el.setAttribute("ry", ry.toFixed(2));
    el.setAttribute("width", width.toFixed(2));
    el.setAttribute("height", height.toFixed(2));
    el.setAttribute("opacity", opacity.toFixed(2));
    el.setAttribute("fill-opacity", fillOpacity.toFixed(2));
    el.setAttribute("stroke-opacity", strokeOpacity.toFixed(2));
  }
};
