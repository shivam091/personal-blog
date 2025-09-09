import GlobalTicker from "./../global-ticker";
import EventManager from "./../event-manager";
import { resolveDelays } from "./helpers/resolve-delay";
import { applySpringConfigs } from "./helpers/config";

// Spring-based Boop Controller
export default class SpringBoop {
  #timer = null;
  #offTicker = null;
  #animator;

  constructor(animator, boopValues = [], { boopDuration = 150, springConfigs = null } = {}) {
    this._springConfigs = springConfigs; // store configs for later re-application
    this.#animator = animator;
    this.boopDuration = boopDuration;

    this.restVals = animator.getState();
    this.boopVals = SpringBoop.#resolveBoopVals(animator, this.restVals, boopValues);

    this.isBooping = false;
    this.startTime = 0;

    this.eventManager = new EventManager();

    // auto-snap to rest state once springs settle
    animator.onSettle?.(() => this.#snapToRest());

    animator.onUpdate?.(vals => this.eventManager.emit("update", vals));
  }

  // Dynamically update the spring configs for the animator
  setSpringConfigs(springConfigs) {
    this._springConfigs = springConfigs;
    const groups = this.#animator?.groups || [this.#animator];
    applySpringConfigs(groups, springConfigs);
    return this;
  }

  // Retrieve current spring configs for animator/group
  getSpringConfigs() {
    const groups = this.#animator?.groups || [this.#animator];
    return groups.map(group =>
      Object.fromEntries(
        Object.entries(group.springs).map(([key, spring]) => [key, spring.config])
      )
    );
  }

  // Apply per-spring boop and rest transitions with delays
  #applySpringDelays(group, boopTarget, restTarget, springDelayObj, duration) {
    const keys = Object.keys(group.springs);

    keys.forEach(key => {
      const springDelay = springDelayObj[key] || 0;

      [boopTarget, restTarget].forEach((target, idx) => {
        setTimeout(() => {
          group.springs[key].setTarget(target[key]);
        }, springDelay + (idx * duration));
      });
    });
  }

  // Snap animator instantly to rest
  #snapToRest() {
    if (!this.restVals) return;

    // force-set springs to restVals and stop
    if (this.#animator.hardReset) {
      this.#animator.hardReset(this.restVals);
    } else if (this.#animator.jumpTo) {
      this.#animator.jumpTo(this.restVals);
    }

    this.eventManager.emit("update", this.restVals);
    this.eventManager.emit("stop");
  }

  // Merge boop values with rest values for Morph or Group animators
  static #resolveBoopVals(animator, restVals, boopValues) {
    if (Array.isArray(restVals)) {
      // Morph-style (array of states)
      return restVals.map((rest, i) => {
        const target = Array.isArray(boopValues) ? boopValues[i] || {} : boopValues || {};
        return { ...rest, ...target };
      });
    }

    // Group-style (single object)
    const boop = typeof boopValues === "object" ? boopValues : {};
    return { ...restVals, ...boop };
  }

  // Triggers boop with optional per-element delay
  trigger({ duration = this.boopDuration, delay = 0 } = {}) {
    if (this.isBooping) {
      clearTimeout(this.#timer);
      this.reset();
    }

    this.isBooping = true;
    this.startTime = performance.now();

    this.eventManager.emit("start");
    this.eventManager.emit("progress", 0);

    const groups = this.#animator?.groups || null;
    const delays = resolveDelays(groups ? groups.length : 1, delay);

    if (Array.isArray(groups)) {
      // flat delay for whole group
      groups.forEach((group, i) => {
        const boopTarget = this.boopVals[i];
        const restTarget = this.restVals[i];
        if (!boopTarget) return;

        const adapter = this.#animator.registry?.getAdapter(this.#animator.elements[i]);
        const adaptedTarget = adapter?.objectToPoints ? adapter.objectToPoints(boopTarget) : boopTarget;

        const groupDelay = delays[i] || 0;

        setTimeout(() => {
          group.setTarget(adaptedTarget);

          setTimeout(() => {
            group.setTarget(restTarget);
          }, duration);
        }, groupDelay);
      });

      const maxGroupDelay = Math.max(...delays);
      this.#timer = setTimeout(() => this.reset(), duration + maxGroupDelay);
    } else {
      // single-group boop
      const group = this.#animator;
      const boopTarget = this.boopVals;
      const restTarget = this.restVals;

      if (delay && typeof delay === "object") {
        // per-spring delays
        this.#applySpringDelays(group, boopTarget, restTarget, delay, duration);

        const maxSpringDelay = Math.max(...Object.values(delay));

        this.#timer = setTimeout(() => this.reset(), duration + maxSpringDelay);
      } else {
        // flat delay
        const startBoop = () => {
          this.#animator.setTarget(boopTarget);
          this.#timer = setTimeout(() => this.reset(), duration);
        };

        delay > 0 ? (this.#timer = setTimeout(startBoop, delay)) : startBoop();
      }
    }

    // start ticker for global progress
    this.#offTicker = GlobalTicker.add(() => this.#tick(delays));
  }

  // Per-frame progress update (for both single and multi-group)
  #tick = (delays = []) => {
    if (!this.isBooping) return;

    const now = performance.now();
    let maxProgress = 0;

    const groups = this.#animator?.groups || null;

    if (Array.isArray(groups)) {
      groups.forEach((_, i) => {
        const start = this.startTime + (delays[i] || 0);
        const elapsed = now - start;
        const localProgress = Math.min(1, Math.max(0, elapsed / this.boopDuration));
        maxProgress = Math.max(maxProgress, localProgress);
      });
    } else {
      const elapsed = now - this.startTime;
      maxProgress = Math.min(1, elapsed / this.boopDuration);
    }

    this.eventManager.emit("progress", maxProgress);
  };

  // Reset to rest values (for both single and multi-group)
  reset() {
    if (!this.restVals) return;

    const groups = this.#animator?.groups || null;

    if (Array.isArray(groups)) {
      groups.forEach((group, i) => {
        group.setTarget(this.restVals[i]);
      });
    } else {
      this.#animator.setTarget(this.restVals);
    }

    this.isBooping = false;

    if (this.#offTicker) {
      this.#offTicker();
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
    this.eventManager.emit("dispose");
  }

  // Dynamically update rest + boop targets
  setBoopValues(restVals, boopValues) {
    this.restVals = restVals;
    this.boopVals = SpringBoop.#resolveBoopVals(this.#animator, restVals, boopValues);
  }

  // Re-sync rest + boop values to animator’s current state
  syncToCurrent() {
    this.restVals = this.#animator.getState();
    this.boopVals = SpringBoop.#resolveBoopVals(this.#animator, this.restVals, this.boopVals);
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
