import { buildPath, normalizePath } from "./../helpers/path";
import { BaseAdapter } from "./base";

// WeakMap to store parsed path segments per element
const store = new WeakMap();
// WeakMap to cache sorted keys for pointsToObject
const keyCache = new WeakMap();

// Adapter for animating <path> points with springs
class PathAdapterImpl extends BaseAdapter {
  constructor() {
    super(["transform", "opacity", "fill-opacity", "stroke-opacity"]);
  }

  // Extracts attributes from <path> element
  extractAttributes(el) {
    const props = super.extractAttributes(el);

    const segs = normalizePath(el.getAttribute("d") || "");
    store.set(el, { segs, pointsPerSegment: this._inferPointsPerSegment(segs) });

    let i = 0;
    for (const seg of segs) {
      for (const pt of seg.points) {
        for (const n of pt) {
          props[`x${i}`] = n;
          i++;
        }
      }
    }

    return props;
  }

  // Applies state values back to <path> element
  setAttributes(el, group) {
    const data = store.get(el);
    if (!data) return;

    const { segs } = data;
    const state = group.getState();
    let i = 0;

    for (const seg of segs) {
      for (const pt of seg.points) {
        for (let j = 0; j < pt.length; j++) {
          pt[j] = state[`x${i}`] ?? pt[j];
          i++;
        }
      }
    }

    el.setAttribute("d", buildPath(segs));

    super.setAttributes(el, group);
  }

  // Converts object of arrays → flat { x0, x1, ... }
  objectToPoints(target) {
    if (!target) return;
    const obj = {};
    let i = 0;

    for (const key in target) {
      const vals = target[key];
      for (let j = 0; j < vals.length; j++) {
        obj[`x${i}`] = vals[j];
        i++;
      }
    }

    return obj;
  }

  // Converts flat { x0, x1, ... } → array of arrays for segments
  pointsToObject(obj, el) {
    if (!obj) return [];

    let sortedKeys = keyCache.get(el);
    if (!sortedKeys) {
      sortedKeys = Object.keys(obj)
        .filter(k => /^x\d+$/.test(k))
        .sort((a, b) => parseInt(a.slice(1), 10));
      keyCache.set(el, sortedKeys);
    }

    const values = new Array(sortedKeys.length);
    for (let i = 0; i < sortedKeys.length; i++) {
      values[i] = obj[sortedKeys[i]];
    }

    const data = store.get(el);
    const pointsPerSegment = data?.pointsPerSegment || 2;
    const result = new Array(Math.ceil(values.length / pointsPerSegment));

    for (let i = 0; i < result.length; i++) {
      const start = i * pointsPerSegment;
      const end = start + pointsPerSegment;
      const seg = new Array(pointsPerSegment);
      for (let j = start; j < end; j++) {
        seg[j - start] = values[j] ?? 0;
      }
      result[i] = seg;
    }

    return result;
  }

  // Infer points per segment based on first segment (fast path for M/L)
  _inferPointsPerSegment(segs) {
    if (!segs || !segs.length) return 2;
    const first = segs[0];
    if (first.points && first.points[0]) return first.points[0].length;
    return 2;
  }
}

// Export a single instance for registry usage
export const PathAdapter = new PathAdapterImpl();
