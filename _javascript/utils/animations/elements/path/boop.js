import SpringBoop from "./../../spring-boop";
import PathMorph from "./morph";

// Adds boop interactions to <path> elements
export default class PathMorphBoop extends SpringBoop {
  constructor(paths, boopValues = [], springConfigs = {}) {
    const morph = new PathMorph(paths, springConfigs);
    super(morph, boopValues, { springConfigs });
  }
}
