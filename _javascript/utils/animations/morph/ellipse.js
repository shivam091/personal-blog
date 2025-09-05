export function extractPoints(el) {
  const cx = parseFloat(el.getAttribute("cx")) || 0;
  const cy = parseFloat(el.getAttribute("cy")) || 0;
  const rx = parseFloat(el.getAttribute("rx")) || 0;
  const ry = parseFloat(el.getAttribute("ry")) || 0;

  return [
    [cx, cy],      // center
    [rx, ry],      // radii
  ];
}

export function buildAttributes(el, pointGroups) {
  const [center, radii] = pointGroups.map(g => g.getState());

  el.setAttribute("cx", center.x.toFixed(2));
  el.setAttribute("cy", center.y.toFixed(2));
  el.setAttribute("rx", radii.x.toFixed(2));
  el.setAttribute("ry", radii.y.toFixed(2));
}
