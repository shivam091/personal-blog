export function extractPoints(el) {
  const pts = (el.getAttribute("points") || "")
    .trim()
    .split(/\s+/)
    .map(pair => pair.split(",").map(Number))
    .filter(([x, y]) => !isNaN(x) && !isNaN(y));

  const opacity = parseFloat(el.getAttribute("opacity")) ?? 1;

  // Add opacity as a 1D "point"
  return [...pts, [opacity, 0]];
}

export function buildAttributes(el, pointGroups) {
  const states = pointGroups.map(g => g.getState());
  const pts = states.slice(0, -1); // all but last = polygon coords
  const op = states[states.length - 1]; // last = opacity

  const pointsStr = pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  el.setAttribute("points", pointsStr);
  el.setAttribute("opacity", op.x.toFixed(2));
}
