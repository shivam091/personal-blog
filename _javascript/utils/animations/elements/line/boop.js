import SpringBoop from "./../../spring-boop";
import LineMorph from "./morph";

// Adds boop interactions to <line> elements
export default class LineMorphBoop extends SpringBoop {
  constructor(lines, boopValues = [], springConfig = {}) {
    const morph = new LineMorph(lines, springConfig);
    super(morph, boopValues, "spread");
  }
}
