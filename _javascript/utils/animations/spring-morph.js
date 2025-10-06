import SpringGroup from "./spring-group";
import AdapterRegistry from "./adapter-registry";
import EventManager from "./../event-manager";
import globalTicker from "../global-ticker";
import { resolveDelays } from "./helpers/resolve-delay";
import { SPRINGS } from "../../constants/springs";
import { buildDelays } from "./helpers/resolve-start-delay";
import { clamp } from "../interpolators";
import { applySpringConfigs } from "./helpers/config";

// Morph multiple elements using adapters and SpringGroups
export default class SpringMorph {
  // Prevents multiple emits per frame if multiple groups update
  #pendingUpdate = false;
  #pendingProgress = false;

  constructor(elements, springConfigs) {
    this.elements = Array.from(elements);
    this.groups = [];
    this.registry = new AdapterRegistry();
    this.eventManager = new EventManager();
    this._lastProgress = 1;
    this._started = false;

    const configsArray = Array.isArray(springConfigs)
      ? springConfigs
      : Array(this.elements.length).fill(springConfigs); // single config → fill array

    this._springConfigs = springConfigs; // store configs for later re-application

    this.elements.forEach((el, i) => {
      const adapter = this.registry.getAdapter(el);
      if (!adapter) throw new Error(`No adapter registered for <${el.tagName.toLowerCase()}>`);

      const props = adapter.extractAttributes(el);

      // pick per-group config or fallback to default
      const springConfig = configsArray[i] || SPRINGS.default;

      // ONE SpringGroup manages all props
      const group = new SpringGroup(props, springConfig);

      globalTicker.add(() => {
        if (this.#pendingUpdate) {
          this.#pendingUpdate = false;
          // Only emit once per frame with all group states
          this.eventManager.emit("update", this.getState());
        }

        if (this.#pendingProgress) {
          this.#pendingProgress = false;

          // Aggregate all groups’ last progress values
          const averageProgress = this.groups.length
            ? this.groups.reduce((sum, g) => sum + (g._lastProgress ?? 1), 0) / this.groups.length
            : 1;
          this._lastProgress = clamp(averageProgress, 0, 1);

          // Emit once per frame with aggregated progress
          this.eventManager.emit("progress", this._lastProgress);
        }
      });

      group.onUpdate(() => {
        adapter.setAttributes(el, group);

        this.#pendingUpdate = true;
      });

      group.onSettle(() => {
        this.eventManager.emit("settle", this.getState());
        this.eventManager.emit("stop"); // stop = done animating
        this._started = false; // reset flag once everything stops
      });

      // listen to group's progress and update morph-wide progress
      group.onProgress(progress => {
        group._lastProgress = progress; // cache progress per group

        this.#pendingProgress = true;
      });

      group.onStart(() => this.eventManager.emit("start"));
      group.onStop(() => this.eventManager.emit("stop"));

      this.groups.push(group);
      adapter.setAttributes(el, group);
    });

    // snapshot of initial values
    this.initialState = this.getState();
  }

  // Returns adapter for the element
  #getAdapter(i) {
    return this.registry.getAdapter(this.elements[i]);
  }

  // Updates spring configurations at runtime
  setSpringConfigs(springConfigs) {
    this._springConfigs = springConfigs;
    applySpringConfigs(this.groups, springConfigs);
    return this;
  }

  // Retrieves current spring configs for all groups
  getSpringConfigs() {
    return this.groups.map(group =>
      Object.fromEntries(
        Object.entries(group.springs).map(([key, spring]) => [key, spring.config])
      )
    );
  }

  // Morphs multiple elements to target states instantly with group or per-element delays
  morph(targetsPerElement, { delay = 0 } = {}) {
    const delays = resolveDelays(this.groups.length, delay);

    // Iterate over all groups (one per element) and update target
    this.groups.forEach((group, i) => {
      const target = targetsPerElement[i];
      if (!target) return;

      const adapter = this.#getAdapter(i);
      const adaptedTarget = adapter?.objectToPoints
        ? adapter.objectToPoints(target)
        : target;

      const groupDelay = delays[i] || 0;
      group.setTarget(adaptedTarget, { delay: groupDelay });
    });

    if (!this._started) {
      this._started = true;
      this.eventManager.emit("start"); // notify start of morph
    }
  }

  // Staggered morph for sequential or reversed element animations with optional yoyo
  // (backward/forward/reset), per-element startDelay, and repeat handling
  staggerMorph(
    targets,
    {
      startDelay = 0, // can be a number or array of numbers
      baseDelay = 100,
      reverse = false,
      yoyo = false,
      repeat = 0,
      yoyoMode = "backward" // "backward" | "reset" | "forward", only used if yoyo = true
    } = {}
  ) {
    const delays = buildDelays(targets, { baseDelay, startDelay, reverse, yoyo });

    const playIteration = (iteration = 0) => {
      // forward morph
      const forwardDelays = delays.map(keys => {
        const obj = {};
        for (const k in keys) obj[k] = keys[k].forward;
        return obj;
      });

      // apply morph with delays + global startDelay
      this.morph(targets, { delay: forwardDelays });

      // compute approximate forward duration based on spring settle times
      const forwardDuration = Math.max(...forwardDelays.map(d => Math.max(...Object.values(d)))) + 500; // 500ms buffer

      if (yoyo) {
        const handleYoyo = () => {
          switch (yoyoMode) {
            case "backward": {
              // animate back in reverse stagger order (last → first)
              const backwardDelays = [...delays].reverse().map(keys => {
                const obj = {};
                for (const k in keys) obj[k] = keys[k].backward;
                return obj;
              });
              this.morph(this.initialState, { delay: backwardDelays });
              break;
            }
            case "forward":
              // animate back in the same stagger order as forward (first → last)
              this.morph(this.initialState, { delay: forwardDelays });
              break;
            case "reset":
              // snap back instantly, all elements simultaneously
              this.reset();
              break;
            default:
              throw new Error(`Unknown yoyoMode: ${yoyoMode}`);
          }
        };
        setTimeout(handleYoyo, forwardDuration);
      }

      const cycleDuration = forwardDuration * (yoyo ? 2 : 1);
      if (repeat === Infinity || iteration < repeat) {
        setTimeout(() => playIteration(iteration + 1), cycleDuration);
      }
    };

    playIteration();
  }

  // Resets all elements back to their initial state
  reset() {
    this.morph(this.initialState);
  }

  // Instantly resets all springs to the given state (skips physics)
  hardReset(state = this.initialState) {
    this.groups.forEach((group, i) => {
      const target = state[i];
      if (!target) return;
      group.reset(target); // SpringGroup.reset is instant

      const adapter = this.#getAdapter(i);
      adapter?.setAttributes(this.elements[i], group);
    });
    this.eventManager.emit("update", this.getState());
    this.eventManager.emit("stop");
  }

  // Snapshot of spring values
  getState() {
    return this.groups.map(group => group.getState());
  }

  // Releases group resources and stop updates
  dispose() {
    this.groups.forEach(g => g.dispose());
    this.groups = [];
    this.eventManager.clear();
  }

  // Subscribes to settle event (fires every settle)
  onSettle(fn) {
    this.groups.forEach(g => g.onSettle(() => fn(this.getState())));
    return this;
  }

  // Subscribes to one-time settle event (first settle only)
  onceSettle(fn) {
    this.groups.forEach(g => g.onceSettle(() => fn(this.getState())));
    return this;
  }

  // Subscribes to progress updates (0..1)
  onProgress(fn, { immediate = false } = {}) {
    if (immediate) fn(this._lastProgress);
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
