export default class EventManager {
  constructor() {
    this._events = new Map(); // Map<eventName, Set<listener>>
  }

  // Subscribe to an event; returns unsubscribe function
  on(event, fn) {
    if (!this._events.has(event)) {
      this._events.set(event, new Set());
    }
    this._events.get(event).add(fn);
    return () => this.off(event, fn); // unsubscribe handle
  }

  // Subscribe to an event once; auto-removes after first call
  once(event, fn) {
    const off = this.on(event, (...args) => {
      fn(...args);
      off();
    });
    return off;
  }

  // Unsubscribe from an event
  off(event, fn) {
    this._events.get(event)?.delete(fn);
  }

  // Trigger all listeners for an event
  emit(event, ...args) {
    this._events.get(event)?.forEach(fn => fn(...args));
  }

  // Clear all listeners (or only for specific event)
  clear(event) {
    if (event) {
      this._events.get(event)?.clear();
    } else {
      this._events.clear();
    }
  }
}
