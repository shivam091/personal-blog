/**
 * Resolve delays for a group of elements, supporting:
 * - single number (applied to all elements)
 * - array of numbers (per element)
 * - object (same per-attribute delays for all elements)
 * - array of objects (per-element, per-attribute delays)
 *
 * @param {number} count - number of elements in the group
 * @param {number|array|object} delay - delay definition
 */
export function resolveDelays(count, delay) {
  // Case 1: single number → same for all
  if (typeof delay === "number") {
    return Array(count).fill(delay);
  }

  // Case 2: array of numbers → per element
  if (Array.isArray(delay) && typeof delay[0] === "number") {
    return delay.concat(Array(count - delay.length).fill(0));
  }

  // Case 3: object → same per-attribute delays for all elements
  if (typeof delay === "object" && !Array.isArray(delay)) {
    return Array(count).fill(delay);
  }

  // Case 4: array of objects → per-element, per-attribute delays
  if (Array.isArray(delay) && typeof delay[0] === "object") {
    return delay.concat(Array(count - delay.length).fill({}));
  }

  // Fallback → no delay
  return Array(count).fill(0);
}
