// Adapter for animating <ellipse> attributes with springs
export const EllipseAdapter = {
  // Extracts attributes from <ellipse> element
  extractAttributes: (el) => ({
    cx: +el.getAttribute("cx") || 0,
    cy: +el.getAttribute("cy") || 0,
    rx: +el.getAttribute("rx") || 0,
    ry: +el.getAttribute("ry") || 0,
    opacity: +el.getAttribute("opacity") || 1,
    fillOpacity: +el.getAttribute("fill-opacity") || 1,
    strokeOpacity: +el.getAttribute("stroke-opacity") || 1
  }),

  // Apply state values back to <ellipse> element
  setAttributes: (el, group) => {
    const { cx, cy, rx, ry, opacity, fillOpacity, strokeOpacity } = group.getState();

    el.setAttribute("cx", cx.toFixed(2));
    el.setAttribute("cy", cy.toFixed(2));
    el.setAttribute("rx", rx.toFixed(2));
    el.setAttribute("ry", ry.toFixed(2));
    el.setAttribute("opacity", opacity.toFixed(2));
    el.setAttribute("fill-opacity", fillOpacity.toFixed(2));
    el.setAttribute("stroke-opacity", strokeOpacity.toFixed(2));
  }
};
