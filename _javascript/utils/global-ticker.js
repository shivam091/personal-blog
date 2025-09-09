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
  }

  // Add a listener; returns unsubscribe handle
  add(fn) {
    const off = this.eventManager.on("tick", fn);
    if (!this.running) this.start();
    return off;
  }

  // Start the ticker loop
  start() {
    this.running = true;
    this.last = performance.now();
    this.loop();
  }

  // Main requestAnimationFrame loop
  loop = () => {
    if (!this.running) return;
    const now = performance.now();
    const dt = (now - this.last) / 1000;
    this.last = now;

    // emit tick event to all listeners
    this.eventManager.emit("tick", dt);

    // Continue RAF if there are listeners for 'tick'
    if (this.eventManager.hasListeners?.("tick") ?? this.eventManager._events.get("tick")?.size > 0) {
      requestAnimationFrame(this.loop);
    } else {
      this.running = false;
    }
  };
}

// Exports a singleton instance of GlobalTicker for global RAF updates
export default new GlobalTicker();
