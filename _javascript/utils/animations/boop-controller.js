import EventManager from "./../event-manager";

// Generic trigger/reset animation controller
export default class BoopController {
  constructor(animator, restVals, boopVals, { boopDuration = 150 } = {}) {
    this.animator = animator;
    this.restVals = restVals;
    this.boopVals = boopVals;
    this.boopDuration = boopDuration;

    this.isBooping = false;
    this._timer = null;
    this._raf = null;

    this.eventManager = new EventManager();
  }

  // Internal helper to send values to animator
  _apply(values) {
    if (this.animator.morph) {
      this.animator.morph(values);
    } else if (this.animator.setTarget) {
      this.animator.setTarget(values);
    }
    this.eventManager.emit("update", values);
  }

  // Triggers boop
  trigger(duration = this.boopDuration) {
    if (this.isBooping) return;

    this.isBooping = true;
    this.eventManager.emit("start");
    this.eventManager.emit("progress", 0);
    this._apply(this.boopVals);

    const start = performance.now();
    const tick = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(1, elapsed / duration);

      this.eventManager.emit("progress", progress);

      if (elapsed < duration && this.isBooping) {
        this._raf = requestAnimationFrame(tick);
      } else {
        this._raf = null;
      }
    };
    this._raf = requestAnimationFrame(tick);

    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.reset(), duration);
  }

  // Reset to rest values
  reset() {
    this._apply(this.restVals);
    this.isBooping = false;

    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
    this.eventManager.emit("progress", 1);
    this.eventManager.emit("stop");
  }

  // Stop ongoing boop
  stop() {
    clearTimeout(this._timer);
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }
    this._apply(this.restVals);
    this.isBooping = false;
    this.eventManager.emit("stop");
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
