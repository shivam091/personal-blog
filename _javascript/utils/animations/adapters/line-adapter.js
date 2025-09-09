// Adapter for animating <line> attributes with springs
export const LineAdapter = {
  // Extracts attributes from <line> element
  extractAttributes: (el) => ({
    x1: +el.getAttribute("x1") || 0,
    y1: +el.getAttribute("y1") || 0,
    x2: +el.getAttribute("x2") || 0,
    y2: +el.getAttribute("y2") || 0,
    opacity: +el.getAttribute("opacity") || 1,
    strokeOpacity: +el.getAttribute("stroke-opacity") || 1
  }),

  // Apply state values back to <line> element
  setAttributes: (el, group) => {
    const { x1, y1, x2, y2, opacity, strokeOpacity } = group.getState();

    el.setAttribute("x1", x1.toFixed(2));
    el.setAttribute("y1", y1.toFixed(2));
    el.setAttribute("x2", x2.toFixed(2));
    el.setAttribute("y2", y2.toFixed(2));
    el.setAttribute("opacity", opacity.toFixed(2));
    el.setAttribute("stroke-opacity", strokeOpacity.toFixed(2));
  }
};
