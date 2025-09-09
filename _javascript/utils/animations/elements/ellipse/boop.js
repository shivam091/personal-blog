import SpringBoop from "./../../spring-boop";
import EllipseMorph from "./morph";

// Adds boop interactions to <ellipse> elements
export default class EllipseMorphBoop extends SpringBoop {
  constructor(ellipses, boopValues = [], springConfig = {}) {
    const morph = new EllipseMorph(ellipses, springConfig);
    super(morph, boopValues, "spread");
  }
}
