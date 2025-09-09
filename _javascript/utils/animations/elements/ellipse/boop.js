import SpringBoop from "./../../spring-boop";
import EllipseMorph from "./morph";

// Adds boop interactions to <ellipse> elements
export default class EllipseMorphBoop extends SpringBoop {
  constructor(ellipses, boopValues = [], springConfigs = {}) {
    const morph = new EllipseMorph(ellipses, springConfigs);
    super(morph, boopValues, "spread", springConfigs);
  }
}
