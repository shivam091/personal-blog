export function extractPoints(el) {
  const cx = parseFloat(el.getAttribute("cx")) || 0;
  const cy = parseFloat(el.getAttribute("cy")) || 0;
  const r = parseFloat(el.getAttribute("r")) || 0;

  return [
    [cx, cy], // center
    [r, 0],   // radius
  ];
}

export function buildAttributes(el, pointGroups) {
  const [position, radius] = pointGroups.map(g => g.getState());

  el.setAttribute("cx", position.x.toFixed(2));
  el.setAttribute("cy", position.y.toFixed(2));
  el.setAttribute("r", radius.x.toFixed(2)); // use x as radius
}
