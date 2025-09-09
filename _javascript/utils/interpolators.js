/**
 * Restricts a number to stay within a specified range.
 * 
 * @param {number} value - The number to clamp.
 * @param {number} min - The lower bound of the range.
 * @param {number} max - The upper bound of the range.
 * @returns {number} The clamped value.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two numbers
 * @param {number} startValue - The starting value (when t = 0).
 * @param {number} endValue - The ending value (when t = 1).
 * @param {number} t - Interpolation factor (0 to 1, can go beyond for extrapolation).
 * @returns {number} Interpolated value between startValue and endValue.
 */
export function lerp(startValue, endValue, t) {
  return startValue + (endValue - startValue) * t;
}