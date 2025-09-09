import SpringBoop from "./../../spring-boop";
import UseMorph from "./morph";

// Adds boop interactions to <use> elements
export default class UseMorphBoop extends SpringBoop {
  constructor(uses, boopValues = [], springConfig = {}) {
    const morph = new UseMorph(uses, springConfig);
    super(morph, boopValues, "spread");
  }
}
