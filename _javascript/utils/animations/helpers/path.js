// Regex to match commands
const CMD_REGEX = /[a-zA-Z][^a-zA-Z]*/g;

// Regex to match numbers
const NUM_REGEX = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;

/**
 * Converts an SVG path string into an array of path segments.
 * Each segment is represented as an object with:
 *   - type: "M", "L", "Q", "C", "A", "Z", or "RAW"
 *   - points: an array of coordinate arrays (for "A" includes [rx, ry, xRot, large, sweep, x, y])
 *
 * This simplified version:
 *   - Normalize a path string into an array of segments with explicit points.
 *   - Supports: M, L, H, V, Q, T, C, S, A, Z
 *   - Does NOT convert relative coordinates.
 *   - Unrecognized commands are stored as RAW
 *
 * @param {string} d - The SVG path string
 * @returns {Array<{type: string, points: Array<Array<number>>}|{type: "RAW", raw: string}>}
 */
export function normalizePath(d) {
  const segs = []; // Output array of path segments

  let prevQ = null, prevC2 = null;

  // Split path string into chunks: command + numeric values
  d.replace(CMD_REGEX, chunk => {
    const rawCmd = chunk[0];
    const cmd = rawCmd.toUpperCase(); // Command letter
    const nums = (chunk.slice(1).match(NUM_REGEX) || []).map(Number); // Parse numbers
    let k = 0;
    const next = n => nums.slice(k, k + n); // Get next n numbers
    const push = (...pts) => segs.push({ type: cmd, points: pts }); // Push segment
    const reflect = (px, py, x, y) => [2 * x - px, 2 * y - py];

    // Handle commands
    switch (cmd) {
      case "M":
      case "L":
        while (k < nums.length) {
          const [x, y] = next(2);
          push([x, y]);
          k += 2;
          prevQ = prevC2 = null;
        }
        break;

      case "H":
        while (k < nums.length) {
          const [x] = next(1);
          push([x, 0]); // placeholder 0 for y; PathAdapter can handle real y if needed
          k += 1;
          prevQ = prevC2 = null;
        }
        break;

      case "V":
        while (k < nums.length) {
          const [y] = next(1);
          push([0, y]); // placeholder 0 for x
          k += 1;
          prevQ = prevC2 = null;
        }
        break;

      case "Q":
        while (k < nums.length) {
          const [c1x, c1y, x, y] = next(4);
          push([c1x, c1y], [x, y]);
          k += 4;
          prevQ = [c1x, c1y];
          prevC2 = null;
        }
        break;

      case "T":
        while (k < nums.length) {
          const [x, y] = next(2);
          const [c1x, c1y] = prevQ ? reflect(prevQ[0], prevQ[1], 0, 0) : [0, 0];
          push([c1x, c1y], [x, y]);
          k += 2;
          prevQ = [c1x, c1y];
          prevC2 = null;
        }
        break;

      case "C":
        while (k < nums.length) {
          const [c1x, c1y, c2x, c2y, x, y] = next(6);
          push([c1x, c1y], [c2x, c2y], [x, y]);
          k += 6;
          prevC2 = [c2x, c2y];
          prevQ = null;
        }
        break;

      case "S":
        while (k < nums.length) {
          const [c2x, c2y, x, y] = next(4);
          const [c1x, c1y] = prevC2 ? reflect(prevC2[0], prevC2[1], 0, 0) : [0, 0];
          push([c1x, c1y], [c2x, c2y], [x, y]);
          k += 4;
          prevC2 = [c2x, c2y];
          prevQ = null;
        }
        break;

      case "A":
        while (k < nums.length) {
          const [rx, ry, xRot, large, sweep, x, y] = next(7);
          push([rx, ry, xRot, large, sweep, x, y]);
          k += 7;
          prevQ = prevC2 = null;
        }
        break;

      case "Z":
        segs.push({ type: "Z", points: [] });
        break;

      default:
        segs.push({ type: "RAW", raw: chunk });
    }
  });

  return segs;
}

/**
 * Converts an array of path segment objects back into an SVG path string.
 * This reverses normalizePath, producing a string suitable for the 'd' attribute.
 * Supports: M, L, H, V, Q, T, C, S, A, Z
 *
 * @param {Array} segs - Array of segment objects returned from normalizePath
 * @returns {string} - SVG path string
 */
export function buildPath(segs) {
  const parts = [];
  const f = n => +n.toFixed(2); // round to 2 decimals

  for (const s of segs) {
    switch (s.type) {
      case "M":
      case "L": {
        const [p] = s.points;
        parts.push(`${s.type} ${f(p[0])} ${f(p[1])}`);
        break;
      }
      case "H": {
        const [p] = s.points;
        parts.push(`H ${f(p[0])}`);
        break;
      }
      case "V": {
        const [p] = s.points;
        parts.push(`V ${f(p[1])}`);
        break;
      }
      case "Q": {
        const [c, e] = s.points;
        parts.push(`Q ${f(c[0])} ${f(c[1])} ${f(e[0])} ${f(e[1])}`);
        break;
      }
      case "T": {
        const [c, e] = s.points; // stored as [control, end]
        parts.push(`T ${f(e[0])} ${f(e[1])}`);
        break;
      }
      case "C": {
        const [c1, c2, e] = s.points;
        parts.push(`C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(e[0])} ${f(e[1])}`);
        break;
      }
      case "S": {
        const [c1, c2, e] = s.points; // stored as [reflected control, control2, end]
        parts.push(`S ${f(c2[0])} ${f(c2[1])} ${f(e[0])} ${f(e[1])}`);
        break;
      }
      case "A": {
        const [p] = s.points; // [rx, ry, xRot, large, sweep, x, y]
        parts.push(`A ${f(p[0])} ${f(p[1])} ${f(p[2])} ${p[3]} ${p[4]} ${f(p[5])} ${f(p[6])}`);
        break;
      }
      case "Z":
        parts.push("Z");
        break;
      case "RAW":
        parts.push(s.raw);
        break;
    }
  }

  return parts.join(" ");
}
