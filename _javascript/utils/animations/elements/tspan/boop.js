import SpringBoop from "./../../spring-boop";
import TspanMorph from "./morph";

// Adds boop interactions to <tspan> elements
export default class TspanMorphBoop extends SpringBoop {
  constructor(tspans, boopValues = [], springConfigs = {}) {
    const morph = new TspanMorph(tspans, springConfigs);
    super(morph, boopValues, { springConfigs });
  }
}
