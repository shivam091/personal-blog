// Adapter for animating <circle> attributes with springs
export const CircleAdapter = {
  // Extracts attributes from <circle> element
  extractAttributes: (el) => ({
    r: +el.getAttribute("r") || 0,
    cx: +el.getAttribute("cx") || 0,
    cy: +el.getAttribute("cy") || 0,
    opacity: +el.getAttribute("opacity") || 1,
    fillOpacity: +el.getAttribute("fill-opacity") || 1,
    strokeOpacity: +el.getAttribute("stroke-opacity") || 1
  }),

  // Apply state values back to <circle> element
  setAttributes: (el, group) => {
    const { r, cx, cy, opacity, fillOpacity, strokeOpacity } = group.getState();

    el.setAttribute("r", r.toFixed(2));
    el.setAttribute("cx", cx.toFixed(2));
    el.setAttribute("cy", cy.toFixed(2));
    el.setAttribute("opacity", opacity.toFixed(2));
    el.setAttribute("fill-opacity", fillOpacity.toFixed(2));
    el.setAttribute("stroke-opacity", strokeOpacity.toFixed(2));
  }
};
