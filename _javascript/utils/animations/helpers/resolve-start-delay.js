/**
 * Resolve delay for one element index and optional property key.
 * Supports number, array of numbers, object, and array of objects.
 */
function resolveStartDelay(startDelay, i, key) {
  if (typeof startDelay === "number") {
    // single number
    return startDelay;
  }

  if (Array.isArray(startDelay)) {
    const delay = startDelay[i] ?? 0;

    if (typeof delay === "number") {
      // array of numbers
      return delay;
    }
    if (typeof delay === "object" && delay !== null) {
      // array of objects
      return delay[key] ?? 0;
    }
  }

  if (typeof startDelay === "object" && startDelay !== null) {
    // single object
    return startDelay[key] ?? 0;
  }

  return 0;
}

/**
 * Build resolved delays for each element and property.
 * Returns array of objects keyed by property name with {forward, backward}.
 */
export function buildDelays(targets, {
  baseDelay = 0,
  startDelay = 0,
  reverse = false,
  yoyo = false,
}) {
  const len = targets.length;

  return targets.map((target, i) => {
    const idx = reverse ? (len - 1 - i) : i;
    const base = idx * baseDelay;

    const keyDelays = {};
    for (const key in target) {
      const offset = resolveStartDelay(startDelay, i, key);
      const forward = base + offset;
      const backward = yoyo ? base + offset : 0;
      keyDelays[key] = { forward, backward };
    }

    return keyDelays;
  });
}