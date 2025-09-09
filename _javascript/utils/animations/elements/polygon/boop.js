import SpringBoop from "./../../spring-boop";
import PolygonMorph from "./morph";

// Adds boop interactions to <polygon> elements
export default class PolygonMorphBoop extends SpringBoop {
  constructor(polygons, boopValues = [], springConfig = {}) {
    const morph = new PolygonMorph(polygons, springConfig);
    super(morph, boopValues);
  }
}
