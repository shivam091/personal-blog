export function extractPoints(el) {
  const x = parseFloat(el.getAttribute("x")) || 0;
  const y = parseFloat(el.getAttribute("y")) || 0;
  const w = parseFloat(el.getAttribute("width")) || 0;
  const h = parseFloat(el.getAttribute("height")) || 0;
  const rx = parseFloat(el.getAttribute("rx")) || 0;
  const ry = parseFloat(el.getAttribute("ry")) || 0;

  return [
    [x, y],  // position
    [w, h],  // size
    [rx, ry] // radius
  ];
}

export function buildAttributes(el, pointGroups) {
  const [position, size, radius] = pointGroups.map(g => g.getState());

  el.setAttribute("x", position.x.toFixed(2));
  el.setAttribute("y", position.y.toFixed(2));
  el.setAttribute("width", size.x.toFixed(2));
  el.setAttribute("height", size.y.toFixed(2));
  el.setAttribute("rx", Math.max(0, radius.x).toFixed(2));
  el.setAttribute("ry", Math.max(0, radius.x).toFixed(2));
}
