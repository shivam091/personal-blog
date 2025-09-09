import SpringMorph from "../../spring-morph";

// Morphs <polygon> elements using spring physics
export default class PolygonMorph extends SpringMorph {
  constructor(polygons, springConfig = {}) {
    super(polygons, springConfig);
  }
}
