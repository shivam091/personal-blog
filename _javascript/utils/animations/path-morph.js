import Morph from "./morph";
import { buildPath, normalizePath } from "./morph/path";
/**
 * PathMorph
 * ---------
 * Animates coordinate pairs in a path with a *stable* mapping:
 * - Extracts ordered pairs: M(x,y), L(x,y), Q(c,x), C(c1,c2,x)
 * - Normalizes H/V/S/T to L/C/Q so indices never reshuffle
 */
export default class PathMorph extends Morph {
  constructor(paths, config) {
    const store = new WeakMap();
    super(
      paths,
      config,
      el => {
        const segs = normalizePath(el.getAttribute("d") || "");
        store.set(el, segs);
        const pairs = [];
        const map = [];

        for (const [si, s] of segs.entries()) {
          if (s.type === "M" || s.type === "L") {
            pairs.push([...s.points[0]]);
            map.push([si, 0]);
          } else if (s.type === "Q") {
            pairs.push([...s.points[0]], [...s.points[1]]);
            map.push([si, 0], [si, 1]);
          } else if (s.type === "C") {
            pairs.push([...s.points[0]], [...s.points[1]], [...s.points[2]]);
            map.push([si, 0], [si, 1], [si, 2]);
          }
        }
        store.set(el, { segs, map });
        return pairs;
      },
      (el, pointGroups) => {
        const { segs, map } = store.get(el);
        for (let i = 0; i < map.length; i++) {
          const [si, pi] = map[i];
          const { x, y } = pointGroups[i].getState();
          segs[si].points[pi][0] = x;
          segs[si].points[pi][1] = y;
        }
        el.setAttribute("d", buildPath(segs));
      }
    );
  }

}
