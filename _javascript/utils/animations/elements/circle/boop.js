import SpringBoop from "../../spring-boop";
import CircleMorph from "./morph";

// Adds boop interactions to <circle> elements
export default class CircleMorphBoop extends SpringBoop {
  constructor(circles, boopValues = [], springConfigs = {}) {
    const morph = new CircleMorph(circles, springConfigs);
    super(morph, boopValues, { springConfigs });
  }
}
