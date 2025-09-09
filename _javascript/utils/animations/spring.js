import SpringValue from "./spring-value";
import { clamp } from "./../interpolators";
import EventManager from "./../event-manager";

/**
 * Single-value spring simulation with pooling support.
 * Wraps a SpringValue (bookkeeping) with spring physics & events.
 */
export default class Spring {
  static DEFAULTS = {
    tension: 170,
    friction: 26,
    mass: 1,
    threshold: 0.01,
    clamp: false,
    dt: 1 / 60, // default base simulation step (~16.67ms)
    maxDt: 1 / 30, // clamp for stability (~33ms)
    integrator: "verlet" // "euler" | "verlet" | "rk4"
  };

  constructor(value = 0, config = {}) {
    this.valueState = new SpringValue(value); // delegate bookkeeping
    this.reset(value, config);

    this.eventManager = new EventManager();
  }

  // Reinitialize spring state with given parameters and reset progress
  reset(value = 0, config) {
    this.valueState.reset(value);
    this.velocity = 0;

    // callback function set by SpringGroup to start RAF
    this.setNeedsUpdate = null;

    this.prevValue = value;

    // apply config only when supplied. preserve existing config otherwise.
    if (config !== undefined) {
      this.config = { ...Spring.DEFAULTS, ...config };
    }
  }

  // Unified config setter (with normalization)
  set config(cfg = {}) {
    const c = { ...Spring.DEFAULTS, ...cfg };

    this.tension = c.tension;
    this.friction = c.friction;
    this.mass = c.mass;
    this.threshold = c.threshold;
    this.clamp = c.clamp;
    this.dt = c.dt;
    this.maxDt = c.maxDt;
    this.integrator = c.integrator;
  }

  // Public getter for accessing spring's config in human units
  get config() {
    return {
      tension: this.tension,
      friction: this.friction,
      mass: this.mass,
      threshold: this.threshold,
      clamp: this.clamp,
      dt: this.dt,
      maxDt: this.maxDt,
      integrator: this.integrator
    };
  }

  // Public getter for accessing spring's progress (0..1)
  get progress() {
    return this.valueState.getProgress();
  }

  // Public getter for accessing spring's value
  get value() {
    return this.valueState.getValue();
  }

  // Updates physics target with optional delay
  setTarget(target, { delay = 0 } = {}) {
    const applyTarget = () => {
      this.valueState.setTarget(target);

      // notify SpringGroup to start RAF
      this.setNeedsUpdate?.();
      this.eventManager.emit("start");
    };

    delay > 0 ? setTimeout(applyTarget, delay) : applyTarget();
  }

  // Teleport spring immediately to a value (skips physics)
  jumpTo(value) {
    this.valueState.jumpTo(value);
    this.velocity = 0;
    this.prevValue = value;

    this.eventManager.emit("update", this.value);
    this.eventManager.emit("progress", this.valueState.getProgress());
    this.eventManager.emit("settle", value);
    this.eventManager.emit("stop");
  }

  // Halt animation in progress and freeze spring where it is
  stop() {
    this.velocity = 0;
    this.valueState.setTarget(this.valueState.getValue());
    this.eventManager.emit("stop");
  }

  // Updates spring physics by one step and returns true if the spring has settled
  step(dt = this.dt) {
    const { tension, mass, friction, integrator } = this;
    const { to, from, value } = this.valueState;

    dt = Math.min(dt, this.maxDt);

    // Hooke's law
    const force = (to - value) * tension;
    const acceleration = force / mass;

    // Convert friction to per-frame damping factor
    const damping = 1 - Math.min(Math.max(friction * dt, 0), 1);

    let nextValue;

    if (integrator === "verlet") {
      // Verlet integrator
      const temp = value;
      nextValue = value + (value - this.prevValue) * damping + acceleration * dt * dt;
      this.prevValue = temp;
      this.velocity = (nextValue - this.prevValue) / dt; // derived velocity

    } else if (integrator === "rk4") {
      // Runge–Kutta 4th order integrator
      const deriv = (v, vel) => (to - v) * tension / mass - friction * vel;

      const k1v = deriv(value, this.velocity);
      const k1x = this.velocity;

      const k2v = deriv(value + 0.5 * dt * k1x, this.velocity + 0.5 * dt * k1v);
      const k2x = this.velocity + 0.5 * dt * k1v;

      const k3v = deriv(value + 0.5 * dt * k2x, this.velocity + 0.5 * dt * k2v);
      const k3x = this.velocity + 0.5 * dt * k2v;

      const k4v = deriv(value + dt * k3x, this.velocity + dt * k3v);
      const k4x = this.velocity + dt * k3v;

      this.velocity += (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
      nextValue = value + (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
      this.prevValue = value;

    } else {
      // Symplectic Euler integrator
      this.velocity = this.velocity * damping + acceleration * dt;
      nextValue = value + this.velocity * dt; // scale by dt
      this.prevValue = value;
    }

    // optional clamp
    if (this.clamp) {
      const min = Math.min(from, to);
      const max = Math.max(from, to);
      nextValue = clamp(nextValue, min, max);
    }

    // update SpringValue
    this.valueState.update(nextValue);

    // notify listeners
    this.eventManager.emit("update", this.valueState.getValue());
    this.eventManager.emit("progress", this.valueState.getProgress());

    const settled =
      Math.abs(this.velocity) < this.threshold &&
      Math.abs(to - this.valueState.getValue()) < this.threshold;

    // stop condition: velocity and distance to target are below threshold
    if (settled) {
      this.eventManager.emit("settle", this.valueState.getValue());
      this.eventManager.emit("stop");
    }

    return settled;
  }

  // Subscribe to per-frame updates
  onUpdate(fn, { immediate = false } = {}) {
    if (immediate) fn(this.valueState.getValue());
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

  // Subscribe to progress
  onProgress(fn, { immediate = false } = {}) {
    if (immediate) fn(this.valueState.getProgress());
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
