import SpringBoop from "./../../spring-boop";
import PathMorph from "./morph";

// Adds boop interactions to <path> elements
export default class PathMorphBoop extends SpringBoop {
  constructor(paths, boopValues = [], springConfig = {}) {
    const morph = new PathMorph(paths, springConfig);
    super(morph, boopValues, "spread");
  }
}
