/**
 * Resolves delays for a group of elements, supporting multiple input formats.
 * Returns an array of length `count` where each item represents the delay for
 * that element. Supports numbers, arrays, objects, and mixed cases.
 *
 * @param {number} count - Number of elements in the group.
 * @param {number|object|array} delay - Delay definition, can be:
 *   1. **Single number**: applied to all elements.
 *      Example: `delay = 100` → `[100, 100, 100]` (for count = 3)
 *
 *   2. **Array of numbers**: per-element delays, missing elements default to 0.
 *      Example: `delay = [100, 200]` → `[100, 200, 0]` (for count = 3)
 *
 *   3. **Single object**: same per-property delays applied to all elements.
 *      Example: `delay = { x: 50, y: 100 }` → `[ {x:50,y:100}, {x:50,y:100}, ... ]`
 *
 *   4. **Array of objects**: per-element per-property delays, missing elements default to empty object `{}`.
 *      Example: `delay = [{x:10},{x:20}]` → `[ {x:10}, {x:20}, {} ]` (for count = 3)
 *
 *   5. **Empty array**: treated as no delay → all elements get `0`.
 *
 *   6. **Fallback / unknown types**: defaults to 0 for all elements.
 *
 * @returns {Array<number|object>} Array of resolved delays for each element.
 */
export function resolveDelays(count, delay, keys = []) {
  // Single number → all elements
  if (typeof delay === "number") return Array(count).fill(delay);

  // Array of numbers → map to keys or pad with 0
  if (Array.isArray(delay)) {
    if (delay.length === 0) return Array(count).fill(0);

    if (typeof delay[0] === "number") {
      // If keys are provided (single-group), convert to object per spring
      if (keys.length) {
        const obj = {};
        keys.forEach((key, i) => {
          obj[key] = delay[i] ?? 0;
        });
        return [obj];
      }
      return delay.concat(Array(count - delay.length).fill(0));
    }

    // Array of objects → pad missing
    if (typeof delay[0] === "object") {
      return delay.concat(
        Array(count - delay.length).fill(null).map(() => ({}))
      );
    }
  }

  // Single object → duplicate for all
  if (typeof delay === "object") {
    return Array.from({ length: count }, () => ({ ...delay }));
  }

  // Fallback → no delay
  return Array(count).fill(0);
}
