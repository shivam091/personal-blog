import { BaseAdapter } from "./base";

// Adapter for animating <polygon>/<polyline> points with springs
class PolyPointsAdapterImpl extends BaseAdapter {
  constructor() {
    super(["transform", "opacity", "fill-opacity", "stroke-opacity"]);
  }

  // Extract attributes from <polygon> and <polyline> elements
  extractAttributes(el) {
    const props = super.extractAttributes(el);
    const raw = el.getAttribute("points") || "";
    const nums = raw
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter(n => !isNaN(n));
    nums.forEach((n, i) => (props[`p${i}`] = n));
    return props;
  }

  // Apply state values back to <polygon> and <polyline> elements
  setAttributes(el, group) {
    // Clone group state to avoid mutating original
    const state = group.getState();

    // Handle points first
    const pointKeys = Object.keys(state)
      .filter(k => k.startsWith("p"))
      .sort((a, b) => +a.slice(1) - +b.slice(1));

    if (pointKeys.length) {
      const points = [];
      for (let i = 0; i < pointKeys.length; i += 2) {
        const x = state[pointKeys[i]] ?? 0;
        const y = state[pointKeys[i + 1]] ?? 0;
        points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
      }
      el.setAttribute("points", points.join(" "));
    }

    // Call BaseAdapter for whitelisted attributes & transforms
    super.setAttributes(el, group);
  }

  // Convert target { points: [...] } into flat { p0, p1, ... } object
  objectToPoints(target) {
    if (target.points) {
      const obj = {};
      target.points.forEach((n, i) => (obj[`p${i}`] = n));
      ["opacity", "fillOpacity", "strokeOpacity"].forEach(attr => {
        if (target[attr] !== undefined) obj[attr] = +target[attr];
      });
      // if (target.opacity !== undefined) obj.opacity = +target.opacity;
      // if (target.fillOpacity !== undefined) obj.fillOpacity = +target.fillOpacity;
      // if (target.strokeOpacity !== undefined) obj.strokeOpacity = +target.strokeOpacity;
      return obj;
    }
    return target;
  }

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
}

// Export a single instance for registry usage
export const PolyPointsAdapter = new PolyPointsAdapterImpl();
