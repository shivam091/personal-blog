import SpringBoop from "./../../spring-boop";
import PolyLineMorph from "./morph";

// Adds boop interactions to <polyline> elements
export default class PolyLineMorphBoop extends SpringBoop {
  constructor(polylines, boopValues = [], springConfig = {}) {
    const morph = new PolyLineMorph(polylines, springConfig);
    super(morph, boopValues, "spread");
  }
}
