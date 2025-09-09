import { buildPath, normalizePath } from "./../helpers/path";
import { BaseAdapter } from "./base";

// WeakMap to store parsed path segments per element
const store = new WeakMap();

class PathAdapterImpl extends BaseAdapter {
  constructor() {
    super(["transform", "opacity", "fill-opacity", "stroke-opacity"]);
  }

  // Extract all numbers (points) from <path> for animation
  extractAttributes(el) {
    const props = super.extractAttributes(el);

    const segs = normalizePath(el.getAttribute("d") || "");
    store.set(el, { segs });

    let i = 0;
    segs.forEach(seg => {
      seg.points.forEach(pt => {
        pt.forEach(n => {
          props[`x${i}`] = n;
          i++;
        });
      });
    });

    return props;
  }

  // Apply state values back to <path>
  setAttributes(el, group) {
    const data = store.get(el);
    if (!data) return;

    const { segs } = data;
    const state = group.getState();
    let i = 0;

    segs.forEach(seg => {
      seg.points.forEach(pt => {
        for (let j = 0; j < pt.length; j++) {
          pt[j] = state[`x${i}`] ?? pt[j];
          i++;
        }
      });
    });

    el.setAttribute("d", buildPath(segs));

    // Call BaseAdapter for whitelisted attributes & transforms
    super.setAttributes(el, group);
  }

  // Convert object of arrays → flat { x0, x1, ... } for animation
  objectToPoints(target) {
    if (!target) return;
    const obj = {};
    let i = 0;
    for (const key of Object.keys(target)) {
      const vals = target[key];
      for (let j = 0; j < vals.length; j++) {
        obj[`x${i}`] = vals[j];
        i++;
      }
    }
    return obj;
  }

  // Reverse: flat { x0, x1, ... } → array of arrays for segments
  pointsToObject(obj, pointsPerSegment = 2) {
    const values = Object.keys(obj)
      .filter(k => /^x\d+$/.test(k))
      .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10))
      .map(k => obj[k]);

    const result = [];
    for (let i = 0; i < values.length; i += pointsPerSegment) {
      result.push(values.slice(i, i + pointsPerSegment));
    }
    return result;
  }
}

// Export a single instance for registry usage
export const PathAdapter = new PathAdapterImpl();
