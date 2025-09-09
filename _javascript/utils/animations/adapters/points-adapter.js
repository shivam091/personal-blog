// Adapter for animating <polygon>/<polyline> points with springs
export const PointsAdapter = {
  // Extract attributes from <polygon> and <polyline> elements
  extractAttributes(el) {
    const raw = el.getAttribute("points") || "";
    const nums = raw
      .trim()
      .split(/[\s,]+/)  // handle both spaces and commas
      .map(Number)
      .filter(n => !isNaN(n));

    const props = {};
    nums.forEach((n, i) => (props[`p${i}`] = n));

    props.opacity = +el.getAttribute("opacity") || 1;
    props.fillOpacity = +el.getAttribute("fill-opacity") || 1;
    props.strokeOpacity = +el.getAttribute("stroke-opacity") || 1;

    return props;
  },

  // Apply state values back to <polygon> and <polyline> elements
  setAttributes(el, group) {
    const state = group.getState();
    const points = [];

    const keys = Object.keys(state)
      .filter(k => k.startsWith("p"))
      .sort((a, b) => +a.slice(1) - +b.slice(1));

    for (let i = 0; i < keys.length; i += 2) {
      const x = state[keys[i]] ?? 0;
      const y = state[keys[i + 1]] ?? 0;
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }

    el.setAttribute("points", points.join(" "));
    el.setAttribute("opacity", state.opacity.toFixed(2));
    el.setAttribute("fill-opacity", state.fillOpacity.toFixed(2));
    el.setAttribute("stroke-opacity", state.strokeOpacity.toFixed(2));
  },

  // Convert target { points: [...] } into flat { p0, p1, ... } object
  objectToPoints(target) {
    if (target.points) {
      const obj = {};
      target.points.forEach((n, i) => (obj[`p${i}`] = n));
      if (target.opacity !== undefined) obj.opacity = +target.opacity;
      if (target.fillOpacity !== undefined) obj.fillOpacity = +target.fillOpacity;
      if (target.strokeOpacity !== undefined) obj.strokeOpacity = +target.strokeOpacity;
      return obj;
    }
    return target;
  },

  // Optional: convert flat p0, p1... object back to array of [x, y] pairs
  pointsToObject(obj) {
    const keys = Object.keys(obj)
      .filter(k => k.startsWith("p"))
      .sort((a, b) => +a.slice(1) - +b.slice(1));

    const points = [];
    for (let i = 0; i < keys.length; i += 2) {
      const x = obj[keys[i]] ?? 0;
      const y = obj[keys[i + 1]] ?? 0;
      points.push([x, y]);
    }

    return points;
  }
};
