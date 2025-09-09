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

  // Reset to a given value. Clears from/to state.
  reset(value = 0) {
    this.value = this.from = this.to = value;
    this.progress = 1; // fully settled at reset
  }

  // Set a new target. Progress resets to 0 unless already at target.
  setTarget(target) {
    this.from = this.value;
    this.to = target;
    this.progress = (this.from === this.to) ? 1 : 0;
  }

  // Update the current value and recompute progress. Progress is normalized in [0,1].
  update(value) {
    this.value = value;

    if (this.to !== this.from) {
      this.progress = clamp((value - this.from) / (this.to - this.from), 0, 1);
    } else {
      this.progress = 1;
    }
  }

  // Teleport instantly to a given value (skips physics).
  jumpTo(value) {
    this.reset(value);
  }

  // Get current numeric value of the spring
  getValue() {
    return this.value;
  }

  // Get current progress [0..1]
  getProgress() {
    return this.progress;
  }
}
