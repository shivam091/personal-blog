import SpringBoop from "./../../spring-boop";
import PolyLineMorph from "./morph";

// Adds boop interactions to <polyline> elements
export default class PolyLineMorphBoop extends SpringBoop {
  constructor(polylines, boopValues = [], springConfigs = {}) {
    const morph = new PolyLineMorph(polylines, springConfigs);
    super(morph, boopValues, "spread", springConfigs);
  }
}
