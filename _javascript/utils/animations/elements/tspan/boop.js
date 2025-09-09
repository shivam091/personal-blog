import SpringBoop from "./../../spring-boop";
import TspanMorph from "./morph";

// Adds boop interactions to <tspan> elements
export default class TspanMorphBoop extends SpringBoop {
  constructor(tspans, boopValues = [], springConfig = {}) {
    const morph = new TspanMorph(tspans, springConfig);
    super(morph, boopValues, "spread");
  }
}
