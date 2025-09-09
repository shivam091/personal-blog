import SpringPool from "./spring-pool";
import GlobalTicker from "./../global-ticker";
import EventManager from "./../event-manager";

// Manages multiple springs as a group
export default class SpringGroup {
  constructor(initial = {}, springConfig = {}) {
    this.springs = {};
    this.running = false;
    this._unsubscribe = null;

    this.eventManager = new EventManager();

    // Initialize springs from given values
    for (const key in initial) {
      const spring = SpringPool.acquire(initial[key], springConfig);
      spring.setNeedsUpdate = () => this.start();
      this.springs[key] = spring;
    }
  }

  // Update multiple springs with individual targets
  setTarget(targets) {
    for (const key in targets) {
      this.springs[key]?.setTarget(targets[key]);
    }
    this.start();
    this.eventManager.emit("start");
  }

  // Update all springs to share the same target
  setAll(target) {
    for (const key in this.springs) {
      this.springs[key].setTarget(target);
    }
    this.start();
    this.eventManager.emit("start");
  }

  // Reset all springs to new or current values
  reset(values = {}) {
    Object.entries(this.springs).forEach(([k, s]) =>
      s.reset(values[k] ?? s.value)
    );
    this.running = false;
  }

  // Stop all springs immediately
  stop() {
    Object.values(this.springs).forEach(s => s.stop());
    this.running = false;
    this.eventManager.emit("stop");
  }

  // Dispose group and release all pooled springs
  dispose() {
    Object.values(this.springs).forEach(s => SpringPool.release(s));
    this.springs = {};
    this.running = false;
    this._unsubscribe?.();
    this._unsubscribe = null;
    this.eventManager.clear();
  }

  // Start spring updates via global ticker
  start() {
    if (!this.running) {
      this.running = true;
      this._unsubscribe = GlobalTicker.add(dt => this.step(dt));
    }
  }

  // Step each spring forward and notify listeners
  step() {
    let allSettled = true;
    const snapshot = {};
    const progresses = [];

    for (const key in this.springs) {
      const s = this.springs[key];
      snapshot[key] = s.value;
      if (!s.step()) allSettled = false;
      // gather progress from each spring
      progresses.push(s._lastProgress ?? 1);
    }

    this.eventManager.emit("update", snapshot);

    // compute average progress across all springs
    const avgProgress = progresses.length
      ? progresses.reduce((a, b) => a + b, 0) / progresses.length
      : 1;
    this._lastProgress = Math.max(0, Math.min(1, avgProgress));
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

  // Subscribe to group updates with a callback
  subscribe(fn) {
    return this.onUpdate(fn);
  }

  // Get current values of all springs
  getState() {
    const snapshot = {};
    for (const key in this.springs) {
      snapshot[key] = this.springs[key].value;
    }
    return snapshot;
  }

  // Subscribe to settle event (fires every settle)
  onSettle(fn) {
    this.eventManager.on("settle", fn);
    return this;
  }

  // Subscribe to one-time settle event (first settle only)
  onceSettle(fn) {
    this.eventManager.once("settle", fn);
    return this;
  }

  // Subscribe to progress updates (0..1)
  onProgress(fn, { immediate = false } = {}) {
    if (immediate) fn(this._lastProgress ?? 1);
    this.eventManager.on("progress", fn);
    return this;
  }

  // Subscribe to start event
  onStart(fn) {
    this.eventManager.on("start", fn);
    return this;
  }

  // Subscribe to update event
  onUpdate(fn, { immediate = false } = {}) {
    if (immediate) fn(this.getState());
    this.eventManager.on("update", fn);
    return this;
  }

  // Subscribe to stop event
  onStop(fn) {
    this.eventManager.on("stop", fn);
    return this;
  }
}
