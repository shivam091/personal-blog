export function extractPoints(el) {
  const x = parseFloat(el.getAttribute("x")) || 0;
  const y = parseFloat(el.getAttribute("y")) || 0;
  const w = parseFloat(el.getAttribute("width")) || 0;
  const h = parseFloat(el.getAttribute("height")) || 0;
  const opacity = parseFloat(el.getAttribute("opacity")) ?? 1;

  // Parse transform="translate(...) scale(...) rotate(...)"
  const t = el.getAttribute("transform") || "";
  let tx = 0, ty = 0, sx = 1, sy = 1, rot = 0;

  const translate = t.match(/translate\(([-\d.]+)[ ,]([-\d.]+)\)/);
  if (translate) {
    tx = parseFloat(translate[1]);
    ty = parseFloat(translate[2]);
  }

  const scale = t.match(/scale\(([-\d.]+)(?:[ ,]([-\d.]+))?\)/);
  if (scale) {
    sx = parseFloat(scale[1]);
    sy = scale[2] ? parseFloat(scale[2]) : sx;
  }

  const rotate = t.match(/rotate\(([-\d.]+)/);
  if (rotate) {
    rot = parseFloat(rotate[1]);
  }

  return [
    [x, y],        // position
    [w, h],        // size
    [opacity, 0],  // opacity as 1D
    [tx, ty],      // translate
    [sx, sy],      // scale
    [rot, 0],      // rotation
  ];
}

export function buildAttributes(el, pointGroups) {
  const [position, size, opacity, trans, scale, rot] = pointGroups.map(g => g.getState());

  el.setAttribute("x", position.x.toFixed(2));
  el.setAttribute("y", position.y.toFixed(2));
  el.setAttribute("width", size.x.toFixed(2));
  el.setAttribute("height", size.y.toFixed(2));
  el.setAttribute("opacity", opacity.x.toFixed(2));

  // rebuild transform string
  const transform = `
    translate(${trans.x.toFixed(2)},${trans.y.toFixed(2)})
    scale(${scale.x.toFixed(2)},${scale.y.toFixed(2)})
    rotate(${rot.x.toFixed(2)})
  `.trim().replace(/\s+/g, " ");
  el.setAttribute("transform", transform);
}
