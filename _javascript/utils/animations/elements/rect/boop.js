import SpringBoop from "./../../spring-boop";
import RectMorph from "./morph";

// Adds boop interactions to <rect> elements
export default class RectMorphBoop extends SpringBoop {
  constructor(rects, boopValues = [], springConfigs = {}) {
    const morph = new RectMorph(rects, springConfigs);
    super(morph, boopValues, "spread", springConfigs);
  }
}
