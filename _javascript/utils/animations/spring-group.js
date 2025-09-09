import SpringPool from "./spring-pool";
import GlobalTicker from "./../global-ticker";
import EventManager from "./../event-manager";
import { resolveDelays } from "./helpers/resolve-delay";
import { clamp } from "../interpolators";

// Manages multiple springs as a group
export default class SpringGroup {
  constructor(initial = {}, springConfig = {}) {
    this.springs = {};
    this.running = false;
    this._unsubscribe = null;
    this._lastProgress = 1;

    this.eventManager = new EventManager();

    // Initialize springs from given values
    for (const key in initial) {
      const spring = SpringPool.acquire(initial[key], springConfig);
      spring.setNeedsUpdate = () => this.#start();
      this.springs[key] = spring;
    }
  }

  // Updates multiple springs with individual targets
  setTarget(targets, { delay = 0 } = {}) {
    const keys = Object.keys(targets);
    const delays = resolveDelays(keys.length, delay);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const spring = this.springs[key];
      if (!spring) continue;

      // Resolve delay for this spring:
      // - if delays[i] is a number → apply directly
      // - if delays[i] is an object → look up this property key for per-attribute delay
      // This supports number | array<number> | object | array<object>.
      const springDelay = typeof delays[i] === "object" ? delays[i][key] ?? 0 : delays[i];

      spring.setTarget(targets[key], { delay: springDelay });
    }

    this.#start();
    this.eventManager.emit("start");
  }

  // Updates all springs to share the same target
  setAll(target, { delay = 0 } = {}) {
    const keys = Object.keys(this.springs);
    const delays = resolveDelays(keys.length, delay);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const spring = this.springs[key];
      if (!spring) continue;

      // Resolve delay for this spring:
      // - if delays[i] is a number → apply directly
      // - if delays[i] is an object → look up this property key for per-attribute delay
      // This supports number | array<number> | object | array<object>.
      const springDelay = typeof delays[i] === "object" ? delays[i][key] ?? 0 : delays[i];

      spring.setTarget(target, { delay: springDelay });
    }

    this.#start();
    this.eventManager.emit("start");
  }

  // Resets all springs to new or current values
  reset(values = {}) {
    const entries = Object.entries(this.springs);
    for (let i = 0; i < entries.length; i++) {
      const [key, spring] = entries[i];
      spring.reset(values[key] ?? spring.value, spring.config);
    }
    this.running = false;
  }

  // Stops all springs immediately
  stop() {
    const springs = Object.values(this.springs);
    for (let i = 0; i < springs.length; i++) springs[i].stop();

    this.running = false;
    this.eventManager.emit("stop");
  }

  // Disposes group and release all pooled springs
  dispose() {
    const springs = Object.values(this.springs);
    for (let i = 0; i < springs.length; i++) SpringPool.release(springs[i]);

    this.springs = {};
    this.running = false;
    this._unsubscribe?.();
    this._unsubscribe = null;
    this.eventManager.clear();
  }

  // Starts spring updates via global ticker
  #start() {
    if (!this.running) {
      this.running = true;
      this._unsubscribe = GlobalTicker.add(dt => this.#step(dt));
    }
  }

  // Steps each spring forward and notify listeners
  #step(dt = 1 / 60) {
    let allSettled = true;
    const snapshot = {};
    let sumProgress = 0;
    let count = 0;

    const springs = this.springs;
    for (const key in springs) {
      const s = springs[key];
      snapshot[key] = s.value;
      if (!s.step(dt)) allSettled = false;
      sumProgress += s.progress ?? 1;
      count++;
    }

    this.eventManager.emit("update", snapshot);

    // compute average progress across all springs
    const avgProgress = count ? sumProgress / count : 1;
    this._lastProgress = clamp(avgProgress, 0, 1);
    this.eventManager.emit("progress", this._lastProgress);

    if (allSettled) {
      this.running = false;
      this._unsubscribe?.();
      this._unsubscribe = null;

      // fire settle listeners
      this.eventManager.emit("settle", snapshot);
      this.eventManager.emit("stop");
    }
  }

  // Gets current values of all springs
  getState() {
    const snapshot = {};
    const springs = this.springs;
    for (const key in springs) snapshot[key] = springs[key].value;
    return snapshot;
  }

  // Subscribes to settle event (fires every settle)
  onSettle(fn) {
    this.eventManager.on("settle", fn);
    return this;
  }

  // Subscribes to one-time settle event (first settle only)
  onceSettle(fn) {
    this.eventManager.once("settle", fn);
    return this;
  }

  // Subscribes to progress updates (0..1)
  onProgress(fn, { immediate = false } = {}) {
    if (immediate) fn(this._lastProgress ?? 1);
    this.eventManager.on("progress", fn);
    return this;
  }

  // Subscribes to start event
  onStart(fn) {
    this.eventManager.on("start", fn);
    return this;
  }

  // Subscribes to update event
  onUpdate(fn, { immediate = false } = {}) {
    if (immediate) fn(this.getState());
    this.eventManager.on("update", fn);
    return this;
  }

  // Subscribes to stop event
  onStop(fn) {
    this.eventManager.on("stop", fn);
    return this;
  }
}
