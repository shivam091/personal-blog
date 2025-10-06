// Simple pub/sub system managing named events and listener cleanup
export default class EventManager {
  constructor() {
    this._events = new Map(); // Map<eventName, Set<listener>>
  }

  // Subscribes to an event; returns unsubscribe function
  on(event, fn) {
    if (typeof fn !== "function") {
      throw new TypeError(`Listener for event "${event}" must be a function`);
    }

    if (!this._events.has(event)) {
      this._events.set(event, new Set());
    }
    this._events.get(event).add(fn);
    return () => this.off(event, fn); // unsubscribe handle
  }

  // Subscribes once; auto-removes after first call
  once(event, fn) {
    if (typeof fn !== "function") {
      throw new TypeError(`Listener for event "${event}" must be a function`);
    }

    const off = this.on(event, (...args) => {
      fn(...args);
      off();
    });
    return off;
  }

  // Unsubscribes from an event
  off(event, fn) {
    this._events.get(event)?.delete(fn);
  }

  // Triggers all listeners for an event
  emit(event, ...args) {
    this._events.get(event)?.forEach(fn => fn(...args));
  }

  // Clears all listeners (or only for specific event)
  clear(event) {
    if (event) {
      this._events.get(event)?.clear();
    } else {
      this._events.clear();
    }
  }

  // Checks if there are listeners for an event
  hasListeners(event) {
    return this._events.get(event)?.size > 0;
  }

  // Checks if there are zero listeners (no listeners)
  isEmpty(event) {
    return !this._events.get(event)?.size;
  }
}
