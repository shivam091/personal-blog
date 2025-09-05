export function extractPoints(el) {
  const nums = el.getAttribute("points").trim().split(/\s+/).map(Number);
  if (nums.length % 2 !== 0) throw new Error("Invalid polyline points");

  const pts = [];
  for (let i = 0; i < nums.length; i += 2) {
    pts.push([nums[i], nums[i + 1]]);
  }

  return pts;
}

export function buildAttributes(el, pointGroups) {
  const pts = pointGroups
    .map(g => `${g.getState().x.toFixed(2)} ${g.getState().y.toFixed(2)}`)
    .join(" ");
  el.setAttribute("points", pts);
}
