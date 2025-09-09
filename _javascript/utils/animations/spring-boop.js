import BoopController from "./boop-controller";

// Wraps Spring or Morph with boop values
export default class SpringBoop extends BoopController {
  constructor(animator, boopValues = [], mergeStrategy = "auto", springConfigs = null) {
    const restVals = animator.getState();
    const boopVals = SpringBoop.#resolveBoopVals(animator, restVals, boopValues, mergeStrategy);

    super(animator, restVals, boopVals, { springConfigs });

    // auto-snap to rest state once springs settle
    animator.onSettle?.(() => this.#snapToRest());
    animator.onUpdate?.(vals => this.eventManager.emit("update", vals));
  }

  // Snap animator instantly to rest
  #snapToRest() {
    if (!this.restVals) return;

    // force-set springs to restVals and stop
    if (this.animator.hardReset) {
      this.animator.hardReset(this.restVals);
    } else if (this.animator.jumpTo) {
      this.animator.jumpTo(this.restVals);
    }

    this.eventManager.emit("update", this.restVals);
    this.eventManager.emit("stop");
  }

  // Dynamically update rest + boop targets
  setBoopValues(restVals, boopValues, mergeStrategy = "auto") {
    this.restVals = restVals;
    this.boopVals = SpringBoop.#resolveBoopVals(this.animator, restVals, boopValues, mergeStrategy);
  }

  // Re-sync rest + boop values to animator’s current state
  syncToCurrent() {
    this.restVals = this.animator.getState();
    this.boopVals = SpringBoop.#resolveBoopVals(this.animator, this.restVals, this.boopVals, "auto");
  }

  static #resolveBoopVals(animator, restVals, boopValues, mergeStrategy) {
    // Morph-style (array of element states)
    if (Array.isArray(restVals)) {
      return restVals.map((rest, i) => {
        let target = Array.isArray(boopValues) ? boopValues[i] || {} : boopValues || {};

        if (mergeStrategy === "spread") {
          return { ...rest, ...target };
        }

        if (animator.adapter?.objectToPoints) {
          return animator.adapter.objectToPoints(target);
        }

        return target;
      });
    }

    // Group-style (single object)
    const boop = typeof boopValues === "object" ? boopValues : {};
    return { ...restVals, ...boop };
  }

  // Stop ongoing boop
  stop() {
    super.stop();
    this.eventManager.emit("stop");
  }

  // Cleanup
  dispose() {
    super.dispose();
    this.eventManager.emit("dispose");
    this.eventManager.clear();
  }
}
