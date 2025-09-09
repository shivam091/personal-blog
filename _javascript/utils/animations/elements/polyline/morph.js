import SpringMorph from "../../spring-morph";

// Morphs <polyline> elements using spring physics
export default class PolyLineMorph extends SpringMorph {
  constructor(polylines, springConfigs = {}) {
    super(polylines, springConfigs);
  }
}
