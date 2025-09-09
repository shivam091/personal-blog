import SpringBoop from "./../../spring-boop";
import RectMorph from "./morph";

// Adds boop interactions to <rect> elements
export default class RectMorphBoop extends SpringBoop {
  constructor(rects, boopValues = [], springConfig = {}) {
    const morph = new RectMorph(rects, springConfig);
    super(morph, boopValues, "spread");
  }
}
