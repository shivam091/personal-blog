import SpringBoop from "./../../spring-boop";
import UseMorph from "./morph";

// Adds boop interactions to <use> elements
export default class UseMorphBoop extends SpringBoop {
  constructor(uses, boopValues = [], springConfigs = {}) {
    const morph = new UseMorph(uses, springConfigs);
    super(morph, boopValues, { springConfigs });
  }
}
