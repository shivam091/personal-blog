import SpringMorph from "../../spring-morph";

// Morphs <ellipse> elements using spring physics
export default class EllipseMorph extends SpringMorph {
  constructor(ellipses, springConfig = {}) {
    super(ellipses, springConfig);
  }
}
