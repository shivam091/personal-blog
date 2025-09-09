import EventManager from "./../event-manager";
import GlobalTicker from "./../global-ticker";

// Generic trigger/reset animation controller
export default class BoopController {
  #timer = null;
  #offTicker = null; // unsubscribe handle from GlobalTicker

  constructor(animator, restVals, boopVals, { boopDuration = 150, springConfigs = null } = {}) {
    this.animator = animator;
    this.restVals = restVals;
    this.boopVals = boopVals;
    this.boopDuration = boopDuration;

    this._springConfigs = springConfigs; // store configs for later re-application

    this.isBooping = false;
    this.startTime = 0;

    this.eventManager = new EventManager();
  }

  // Internal helper to send values to animator
  #apply(values) {
    if (this.animator.morph) {
      this.animator.morph(values);
    } else if (this.animator.setTarget) {
      this.animator.setTarget(values);
    }
    this.eventManager.emit("update", values);
  }

  // Normalize _springConfigs into an array matching animator.groups length (or null)
  #normalizedSpringConfigs() {
    if (!this._springConfigs || !this.animator?.groups) return null;
    const n = this.animator.groups.length;

    if (Array.isArray(this._springConfigs)) {
      // copy & pad with nulls if shorter
      return this._springConfigs.slice(0, n).concat(Array(Math.max(0, n - this._springConfigs.length)).fill(null));
    }

    // single config -> duplicate for every group
    return Array(n).fill(this._springConfigs);
  }

  // Re-apply per-group configs to the actual Spring instances
  #applySpringConfigs() {
    const configs = this.#normalizedSpringConfigs();
    if (!configs) return;

    configs.forEach((config, i) => {
      if (!config) return;
      const group = this.animator.groups[i];
      if (!group) return;

      // group.springs is an object of Springs; update each one
      Object.values(group.springs).forEach(spring => {
        spring.config = config;
      });
    });
  }

  // Triggers boop with optional delay
  trigger({ duration = this.boopDuration, delay = 0 } = {}) {
    if (this.isBooping) return;

    const start = () => {
      this.isBooping = true;
      this.startTime = performance.now();

      // Re-apply per-element spring configs if provided
      this.#applySpringConfigs();

      this.eventManager.emit("start");
      this.eventManager.emit("progress", 0);
      this.#apply(this.boopVals);

      // attach to global ticker
      this.#offTicker = GlobalTicker.add(this.#tick);

      clearTimeout(this.#timer);
      this.#timer = setTimeout(() => this.reset(), duration);
    };

    if (delay > 0) {
      this.#timer = setTimeout(start, delay);
    } else {
      start();
    }
  }

  // Per-frame update (called by GlobalTicker)
  #tick = () => {
    if (!this.isBooping) return;
    const elapsed = performance.now() - this.startTime;
    const progress = Math.min(1, elapsed / this.boopDuration);

    this.eventManager.emit("progress", progress);

    if (progress >= 1) {
      this.reset();
    }
  };

  // Reset to rest values
  reset() {
    this.#apply(this.restVals);
    this.isBooping = false;

    if (this.#offTicker) {
      this.#offTicker(); // unsubscribe
      this.#offTicker = null;
    }

    this.eventManager.emit("progress", 1);
    this.eventManager.emit("stop");
  }

  // Stop ongoing boop
  stop() {
    clearTimeout(this.#timer);
    this.reset();
  }

  // Cleanup
  dispose() {
    this.stop();
    this.eventManager.clear();
  }

  // Subscribe to start event
  onStart(fn) {
    this.eventManager.on("start", fn);
    return this;
  }

  // Subscribe to stop event
  onStop(fn) {
    this.eventManager.on("stop", fn);
    return this;
  }

  // Subscribe to update event
  onUpdate(fn, { immediate = false } = {}) {
    if (immediate) fn(this.isBooping ? this.boopVals : this.restVals);
    this.eventManager.on("update", fn);
    return this;
  }

  // Subscribe to progress updates (0..1)
  onProgress(fn, { immediate = false } = {}) {
    if (immediate) fn(this.isBooping ? 0 : 1);
    this.eventManager.on("progress", fn);
    return this;
  }
}
