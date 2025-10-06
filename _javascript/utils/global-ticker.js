import EventManager from "./event-manager";

/**
 * GlobalTicker singleton for centralized animation frame updates.
 * Emits delta time (dt) to registered listeners.
 */
class GlobalTicker {
  constructor() {
    this.eventManager = new EventManager(); // use EventManager for listener management
    this.running = false;
    this.last = 0;
    this._loop = this._loop.bind(this); // bind once to avoid reallocation in RAF
  }

  // Adds a listener; returns unsubscribe handle
  add(fn) {
    if (typeof fn !== "function") {
      throw new TypeError("Listener must be a function");
    }
    const off = this.eventManager.on("tick", fn);
    if (!this.running) this.start();
    return off;
  }

  // Starts the ticker loop
  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this._loop);
  }

  // Pauses ticker updates
  pause() {
    this.running = false;
  }

  // Resumes ticker if there are active listeners
  resume() {
    if (!this.running && !this.eventManager.isEmpty("tick")) {
      this.start();
    }
  }

  // Main requestAnimationFrame loop
  _loop() {
    if (!this.running) return;

    const now = performance.now();
    const dt = (now - this.last) / 1000;
    this.last = now;

    // emit tick event to all listeners
    this.eventManager.emit("tick", dt);

    // Continue RAF if there are listeners for 'tick'
    if (!this.eventManager.isEmpty("tick")) {
      requestAnimationFrame(this._loop);
    } else {
      this.running = false;
    }
  };
}

// Exports a singleton instance of GlobalTicker for global RAF updates
export default new GlobalTicker();
