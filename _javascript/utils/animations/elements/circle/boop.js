import SpringBoop from "../../spring-boop";
import CircleMorph from "./morph";

// Adds boop interactions to <circle> elements
export default class CircleMorphBoop extends SpringBoop {
  constructor(circles, boopValues = [], springConfig = {}) {
    const morph = new CircleMorph(circles, springConfig);
    super(morph, boopValues, "spread");
  }
}
