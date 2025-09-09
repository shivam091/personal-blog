import SpringGroup from "./spring-group";
import AdapterRegistry from "./adapter-registry";
import EventManager from "./../event-manager";

// Morph multiple elements using adapters and SpringGroups
export default class SpringMorph {
  constructor(elements, springConfig) {
    this.elements = Array.from(elements);
    this.groups = [];
    this.registry = new AdapterRegistry();

    this.eventManager = new EventManager();
    this._lastProgress = 1;

    // Prevents multiple emits per frame if multiple groups update
    this._pendingUpdate = false;
    this._pendingProgress = false;

    this.elements.forEach(el => {
      const adapter = this.registry.getAdapter(el);
      if (!adapter) throw new Error(`No adapter registered for <${el.tagName.toLowerCase()}>`);

      const props = adapter.extractAttributes(el);

      // ONE SpringGroup manages all props
      const group = new SpringGroup(props, springConfig);

      group.subscribe(() => {
        adapter.setAttributes(el, group);
        if (!this._pendingUpdate) {
          this._pendingUpdate = true;
          requestAnimationFrame(() => {
            this._pendingUpdate = false;
            // Only emit once per frame with all group states
            this.eventManager.emit("update", this.getState());
          });
        }
      });

      group.onSettle(() => {
        this.eventManager.emit("settle", this.getState());
        this.eventManager.emit("stop"); // stop = done animating
      });

      // listen to group's progress and update morph-wide progress
      group.onProgress(prog => {
        // store group last progress on the group instance for aggregation
        group._lastProgress = prog;

        if (!this._pendingProgress) {
          this._pendingProgress = true;
          requestAnimationFrame(() => {
            this._pendingProgress = false;

            // Aggregate all groups’ last progress values
            const progresses = this.groups.map(g => g._lastProgress ?? 1);
            const avg = progresses.length
              ? progresses.reduce((a, b) => a + b, 0) / progresses.length
              : 1;

            this._lastProgress = Math.max(0, Math.min(1, avg));

            // Emit once per frame with aggregated progress
            this.eventManager.emit("progress", this._lastProgress);
          });
        }
      });

      group.onStart(() => this.eventManager.emit("start"));
      group.onStop(() => this.eventManager.emit("stop"));

      this.groups.push(group);
      adapter.setAttributes(el, group);
    });

    // snapshot of initial values
    this.initialState = this.getState();
  }

  // Update multiple element targets
  morph(targetsPerElement) {
    this.groups.forEach((group, i) => {
      let target = targetsPerElement[i];
      if (!target) return;
      const adapter = this.registry.getAdapter(this.elements[i]);
      if (adapter?.objectToPoints) target = adapter.objectToPoints(target);
      group.setTarget(target);
    });
    this.eventManager.emit("start");
  }

  // Reset all elements back to their initial state
  reset() {
    this.morph(this.initialState);
  }

  // Instantly reset all springs to the given state (skips physics)
  hardReset(state = this.initialState) {
    this.groups.forEach((group, i) => {
      const target = state[i];
      if (!target) return;
      group.reset(target); // SpringGroup.reset is instant
      const adapter = this.registry.getAdapter(this.elements[i]);
      adapter?.setAttributes(this.elements[i], group);
    });
    this.eventManager.emit("update", this.getState());
    this.eventManager.emit("stop");
  }

  // Snapshot of spring values
  getState() {
    return this.groups.map(group => group.getState());
  }

  // Release group resources and stop updates
  dispose() {
    this.groups.forEach(g => g.dispose());
    this.groups = [];
    this.eventManager.clear();
  }

  // Subscribe to settle event (fires every settle)
  onSettle(fn) {
    this.groups.length ? this.groups.forEach(g => g.onSettle(() => fn(this.getState()))) : null;
    return this;
  }

  // Subscribe to one-time settle event (first settle only)
  onceSettle(fn) {
    this.groups.length ? this.groups.forEach(g => g.onceSettle(() => fn(this.getState()))) : null;
    return this;
  }

  // Subscribe to progress updates (0..1)
  onProgress(fn, { immediate = false } = {}) {
    if (immediate) fn(this._lastProgress);
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
