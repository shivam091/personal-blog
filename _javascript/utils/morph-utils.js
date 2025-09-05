export function extractPoints(el) {
  const x1 = parseFloat(el.getAttribute("x1")) || 0;
  const y1 = parseFloat(el.getAttribute("y1")) || 0
  const x2 = parseFloat(el.getAttribute("x2")) || 0
  const y2 = parseFloat(el.getAttribute("y2")) || 0
  const o = parseFloat(el.style.opacity) || 1

  return [
    [x1, y1],
    [x2, y2],
    [o, 0],
  ];
}

export function buildAttr(el, pointGroups) {
  const [p1, p2, op] = pointGroups.map(g => g.getState());

  el.setAttribute("x1", p1.x.toFixed(2));
  el.setAttribute("y1", p1.y.toFixed(2));
  el.setAttribute("x2", p2.x.toFixed(2));
  el.setAttribute("y2", p2.y.toFixed(2));
  el.style.opacity = op.x.toFixed(2);
}
