export function extractPoints(el) {
  const x1 = parseFloat(el.getAttribute("x1")) || 0;
  const y1 = parseFloat(el.getAttribute("y1")) || 0
  const x2 = parseFloat(el.getAttribute("x2")) || 0
  const y2 = parseFloat(el.getAttribute("y2")) || 0
  const op = parseFloat(el.style.opacity) || 1

  return [
    [x1, y1],
    [x2, y2],
    [op, 0],
  ];
}

export function buildAttributes(el, pointGroups) {
  const [pt1, pt2, op] = pointGroups.map(g => g.getState());

  el.setAttribute("x1", pt1.x.toFixed(2));
  el.setAttribute("y1", pt1.y.toFixed(2));
  el.setAttribute("x2", pt2.x.toFixed(2));
  el.setAttribute("y2", pt2.y.toFixed(2));
  el.style.opacity = op.x.toFixed(2);
}
