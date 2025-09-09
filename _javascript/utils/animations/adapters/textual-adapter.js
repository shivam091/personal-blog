// Adapter for animating <text> and <tspan> attributes with springs
export const TextualAdapter = {
  // Extract attributes from <text> and <tspan> elements
  extractAttributes: (el) => ({
    x: +el.getAttribute("x") || 0,
    y: +el.getAttribute("y") || 0,
    dx: +el.getAttribute("dx") || 0,
    dy: +el.getAttribute("dy") || 0,
    opacity: +el.getAttribute("opacity") || 1,
    fontSize: +el.getAttribute("font-size") || 16,
    textLength: +el.getAttribute("textLength") || 0,
    fillOpacity: +el.getAttribute("fill-opacity") || 1,
    letterSpacing: +el.getAttribute("letter-spacing") || 0,
    strokeOpacity: +el.getAttribute("stroke-opacity") || 1
  }),

  // Apply state values back to <text> and <tspan> elements
  setAttributes: (el, group) => {
    const { x, y, dx, dy, opacity, fontSize, textLength, fillOpacity, letterSpacing, strokeOpacity } = group.getState();

    el.setAttribute("x", x.toFixed(2));
    el.setAttribute("y", y.toFixed(2));
    el.setAttribute("dx", dx.toFixed(2));
    el.setAttribute("dy", dy.toFixed(2));
    el.setAttribute("opacity", opacity.toFixed(2));
    el.setAttribute("font-size", fontSize.toFixed(2));
    el.setAttribute("textLength", textLength.toFixed(2));
    el.setAttribute("fill-opacity", fillOpacity.toFixed(2));
    el.setAttribute("letter-spacing", letterSpacing.toFixed(2));
    el.setAttribute("stroke-opacity", strokeOpacity.toFixed(2));
  }
};
