import { clamp } from "./../interpolators";
import EventManager from "./../event-manager";

// Single-value spring simulation with pooling support
export default class Spring {
  static DEFAULTS = {
    tension: 170,
    friction: 26,
    mass: 1,
    threshold: 0.01,
    clamp: false,
  };

  #lastProgress;

  constructor(value = 0, config = {}) {
    this.reset(value, config);

    this.eventManager = new EventManager();
  }

  // Reinitialize spring state with given parameters and reset progress
  reset(value = 0, config = {}) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this.from = this.to = value;

    // callback function set by SpringGroup to start RAF
    this.setNeedsUpdate = null;

    // apply config with defaults
    this.config = { ...Spring.DEFAULTS, ...config };

    // progress bookkeeping
    this.#lastProgress = 1; // at rest progress = 1 (target reached)
  }

  // Unified config setter
  set config(cfg = {}) {
    const c = { ...Spring.DEFAULTS, ...cfg };

    // multiplier model (React-Spring style)
    this.tension = c.tension > 10 ? c.tension / 1000 : c.tension;
    this.friction = c.friction > 1 ? 1 - c.friction / 100 : c.friction;

    this.mass = c.mass;
    this.threshold = c.threshold;
    this.clamp = c.clamp;
  }

  // Public getter for accessing spring's config
  get config() {
    return {
      tension: this.tension * 1000, // reverse conversion
      friction: (1 - this.friction) * 100,
      mass: this.mass,
      threshold: this.threshold,
      clamp: this.clamp,
    };
  }

  // Public getter for accessing spring's progress
  get progress() {
    return this.#lastProgress;
  }

  // Updates physics target
  setTarget(target, { delay = 0 } = {}) {
    const applyTarget = () => {
      this.from = this.value; // snapshot old value for clamp
      this.to = this.target = target; // store new value for clamp & set physics target

      // reset progress when a new target arrives
      this.#lastProgress = (this.from === this.to) ? 1 : 0;

      // notify SpringGroup to start RAF
      this.setNeedsUpdate?.();
      this.eventManager.emit("start");
    };

    // apply optional delay
    if (delay > 0) {
      setTimeout(applyTarget, delay);
    } else {
      applyTarget();
    }
  }

  // Teleport spring immediately to a value (skips physics)
  jumpTo(value) {
    this.value = this.target = this.from = this.to = value;
    this.velocity = 0;
    this.#lastProgress = 1;
  }

  // Halt animation in progress and freeze spring where it is
  stop() {
    this.velocity = 0;
    this.target = this.value;
    this.eventManager.emit("stop");
  }

  // Updates spring physics
  step() {
    const { target, value, tension, mass, friction } = this;

    // apply Hooke’s law with multiplier-style friction
    const force = (target - value) * tension;
    const acceleration = force / mass;
    this.velocity = this.velocity * friction + acceleration;
    this.value += this.velocity;

    // clamp between old & new values if enabled
    if (this.clamp) {
      const min = Math.min(this.from, this.to);
      const max = Math.max(this.from, this.to);
      this.value = clamp(this.value, min, max);
    }

    // notify listeners
    this.eventManager.emit("update", this.value);

    // compute normalized progress (0..1) where 0 = at 'from', 1 = at 'to'
    let progress = 1;
    if (this.to !== this.from) {
      progress = (this.value - this.from) / (this.to - this.from);
      // if direction reversed, progress computation still valid; clamp to [0,1]
      progress = Math.max(0, Math.min(1, progress));
    }
    this.#lastProgress = progress;
    this.eventManager.emit("progress", progress);

    const settled =
      Math.abs(this.velocity) < this.threshold &&
      Math.abs(this.target - this.value) < this.threshold;

    // stop condition: velocity and distance to target are below threshold
    if (settled) {
      this.eventManager.emit("settle", this.value);
      this.eventManager.emit("stop");
    }

    return settled;
  }

  // Subscribe to per-frame updates
  onUpdate(fn, { immediate = false } = {}) {
    if (immediate) fn(this.value);
    this.eventManager.on("update", fn);
    return this;
  }

  // Subscribe to settle (fires every time)
  onSettle(fn) {
    this.eventManager.on("settle", fn);
    return this;
  }

  // Subscribe to one-time settle
  onceSettle(fn) {
    this.eventManager.once("settle", fn);
    return this;
  }

  // Subscribe to progress (0..1)
  onProgress(fn, { immediate = false } = {}) {
    if (immediate) fn(this.#lastProgress);
    this.eventManager.on("progress", fn);
    return this;
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
}
