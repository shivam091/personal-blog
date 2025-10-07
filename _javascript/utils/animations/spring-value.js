import { clamp } from "./../interpolators";

/**
 * Represents a single numeric spring value.
 * Handles value state, from/to targets, and normalized progress.
 *
 * This class is purely responsible for bookkeeping of values
 * and does not know about physics or events.
 */
export default class SpringValue {
  constructor(initial = 0) {
    this.reset(initial);
  }

  // Resets to a given value. Clears from/to state.
  reset(value = 0) {
    this.value = this.from = this.to = value;
    this.progress = 1; // fully settled at reset
  }

  // Sets a new target. Progress resets to 0 unless already at target.
  setTarget(target) {
    this.from = this.value;
    this.to = target;
    this.progress = (this.from === this.to) ? 1 : 0;
  }

  // Updates the current value and recompute progress. Progress is normalized in [0,1].
  update(value) {
    this.value = value;

    if (this.to !== this.from) {
      this.progress = clamp((value - this.from) / (this.to - this.from), 0, 1);
    } else {
      this.progress = 1;
    }
  }

  // Teleports instantly to a given value (skips physics).
  jumpTo(value) {
    this.reset(value);
  }

  // Returns current numeric value of the spring
  getValue() {
    return this.value;
  }

  // Returns current progress [0..1]
  getProgress() {
    return this.progress;
  }

  // Returns how far the current value is from its target
  getDelta() {
    return this.to - this.value;
  }

  // Returns true if the spring value is close enough to its target
  isSettled(threshold = 0.001) {
    return Math.abs(this.to - this.value) < threshold;
  }

  // Interpolates linearly between from and to based on given progress, without changing internal state
  lerpTo(progress) {
    return this.from + (this.to - this.from) * clamp(progress, 0, 1);
  }

  // Directly set from/to without changing value
  setRange(from, to) {
    this.from = from;
    this.to = to;
  }

  // Creates a deep copy of the current instance
  clone() {
    const v = new SpringValue(this.value);
    v.from = this.from;
    v.to = this.to;
    v.progress = this.progress;
    return v;
  }
}
