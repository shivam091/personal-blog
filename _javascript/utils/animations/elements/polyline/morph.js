import SpringMorph from "../../spring-morph";

// Morphs <polyline> elements using spring physics
export default class PolyLineMorph extends SpringMorph {
  constructor(polylines, springConfig = {}) {
    super(polylines, springConfig);
  }
}
