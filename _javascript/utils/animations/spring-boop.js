import BoopController from "./boop-controller";
import EventManager from "./../event-manager";

// Wraps Spring or Morph with boop values
export default class SpringBoop extends BoopController {
  constructor(animator, boopValues = {}, mergeStrategy = "auto") {
    const restVals = animator.getState();
    const boopVals = SpringBoop._resolveBoopVals(animator, restVals, boopValues, mergeStrategy);

    super(animator, restVals, boopVals);

    // auto-snap to exact rest state once springs settle
    animator.onSettle?.(() => this.#snapToRest());

    animator.subscribe?.(vals => {
      this.eventManager.emit("update", vals);
    });
  }

  // Force animator to snap immediately to its rest state
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
    this.boopVals = SpringBoop._resolveBoopVals(this.animator, restVals, boopValues, mergeStrategy);
  }

  // Re-sync rest + boop values to animator’s current state
  syncToCurrent() {
    this.restVals = this.animator.getState();
    this.boopVals = SpringBoop._resolveBoopVals(this.animator, this.restVals, this.boopVals, "auto");
  }

  static _resolveBoopVals(animator, restVals, boopValues, mergeStrategy) {
    if (Array.isArray(restVals)) {
      // Morph-style animator (multiple elements)
      return restVals.map((rest, i) => {
        const target = boopValues[i] || {};

        if (mergeStrategy === "spread") {
          return { ...rest, ...target };
        }

        if (animator.adapter?.objectToPoints) {
          return animator.adapter.objectToPoints(target);
        }

        return target;
      });
    } else {
      // Group-style animator (key/value springs)
      return { ...restVals, ...boopValues };
    }
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
