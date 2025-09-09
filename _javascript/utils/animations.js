/**
 * Remap a number from one range to another
 * @param {number} value - input number
 * @param {number} inMin
 * @param {number} inMax
 * @param {number} outMin
 * @param {number} outMax
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Cubic Bezier easing function generator
 * Returns an easing function mapping t(0-1) -> eased t
 */
export function cubicBezier(p0, p1, p2, p3) {
  return function (t) {
    const cX = 3 * p0;
    const bX = 3 * (p2 - p0) - cX;
    const aX = 1 - cX - bX;

    const cY = 3 * p1;
    const bY = 3 * (p3 - p1) - cY;
    const aY = 1 - cY - bY;

    // Only y curve is used for easing
    const y = ((aY * t + bY) * t + cY) * t;
    return y;
  };
}

/**
 * Animate numeric values using requestAnimationFrame
 * @param {function(number)} onUpdate - callback for each frame with eased progress (0-1)
 * @param {number} duration - total duration in ms
 * @param {function} easing - easing function mapping [0,1] -> [0,1]
 * @param {function=} onComplete - optional callback on finish
 */
export function animate(onUpdate, duration = 300, easing = t => t, onComplete) {
  const start = performance.now();

  function step(now) {
    let t = Math.min((now - start) / duration, 1);
    t = easing(t);
    onUpdate(t);
    if (t < 1) {
      requestAnimationFrame(step);
    } else if (onComplete) {
      onComplete();
    }
  }

  requestAnimationFrame(step);
}
