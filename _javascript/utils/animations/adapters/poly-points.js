import { BaseAdapter } from "./base";

// Adapter for animating <polygon>/<polyline> points with springs
class PolyPointsAdapterImpl extends BaseAdapter {
  constructor() {
    super(["transform", "opacity", "fill-opacity", "stroke-opacity"]);
    this._cachedKeys = new WeakMap(); // cache point key order per element
  }

  // Extracts attributes from <polygon> and <polyline> elements
  extractAttributes(el) {
    const props = super.extractAttributes(el);

    const raw = el.getAttribute("points") || "";
    const nums = raw
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter(n => !isNaN(n));

    nums.forEach((n, i) => (props[`p${i}`] = n));

    // Cache key order for this element
    if (!this._cachedKeys.has(el)) {
      const keys = Object.keys(props).filter(k => k.startsWith("p"));
      this._cachedKeys.set(el, keys);
    }

    return props;
  }

  // Applies state values back to <polygon> and <polyline> elements
  setAttributes(el, group) {
    const state = group.getState();
    const pointKeys = this._cachedKeys.get(el);

    if (pointKeys && pointKeys.length) {
      const points = [];
      for (let i = 0; i < pointKeys.length; i += 2) {
        const x = state[pointKeys[i]] ?? 0;
        const y = state[pointKeys[i + 1]] ?? 0;
        points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
      }
      el.setAttribute("points", points.join(" "));
    }

    // Calls BaseAdapter for whitelisted attributes & transforms
    super.setAttributes(el, group);
  }

  // Converts target { points: [...] } into flat { p0, p1, ... } object
  objectToPoints(target) {
    if (target.points) {
      const obj = {};
      target.points.forEach((n, i) => (obj[`p${i}`] = n));
      ["opacity", "fillOpacity", "strokeOpacity"].forEach(attr => {
        if (target[attr] !== undefined) obj[attr] = +target[attr];
      });
      return obj;
    }
    return target;
  }

  // Optional: converts flat p0, p1... object back to array of [x, y] pairs
  pointsToObject(obj) {
    const keys = Object.keys(obj).filter(k => k.startsWith("p"));
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
